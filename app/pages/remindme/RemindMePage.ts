import {Page, Platform, NavParams, NavController, Alert} from "ionic-framework/ionic";
import * as moment from "moment";
import {getPlugin} from "ionic-native/dist/plugins/plugin";
import {Scheduler} from "../../common/Scheduler";
import * as _ from "lodash";


@Page({
  templateUrl: 'build/pages/remindme/RemindMePage.html',
  providers: [Scheduler],
})
export class RemindMePage {
  public notificationsEnabled:boolean = false;
  public notificationsData:any = false;
  private timeOfDay = 'morning';
  private wasteTypes = ['recycling', 'waste', 'tree', 'junk'];
  private recycling = true;
  private waste = true;
  private junk = false;
  private hour = 6;
  private pos:any;
  private whatDescription:String;

  constructor(private nav:NavController, private navParams: NavParams, private schedulerService:Scheduler) {
    this.notificationsEnabled =  window.localStorage.getItem('notificationsEnabled') == 'true';
    this.notificationsData =  JSON.parse(window.localStorage.getItem('notificationsData') || "{}");
    this.pos = {x: navParams.get('longitude'), y: navParams.get('latitude')};
    this.whatDescription = this.makeDescriptionText(this.activeWasteCategories);
  }

  openTimeOfDay() {
    let confirm = Alert.create({
      title: 'When Should I Alert You?',
      message: 'Are you a night owl or a early riser?',
      buttons: [
        {
          text: 'In the Morning (AM)',
          handler: () => {
            this.timeOfDay = 'morning'
          }
        },
        {
          text: 'At Night (PM)',
          handler: () => {
            this.timeOfDay = 'night'
          }
        }
      ]
    });
    this.nav.present(confirm);
  }
  openHours() {
    let alert = Alert.create({
      title: 'What Time?'
    });

    this.wasteTypes.forEach((num) => {
      alert.addInput({
        type: 'radio',
        label: num,
        value: num,
        checked: this.hour == num
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: data => {
        console.log('selected hour', data);
        this.setHour(data);
      }
    });
    this.nav.present(alert);
  }

  openWhat() {
    let alert = Alert.create({
      title: 'What Types?'
    });

    var active = this.activeWasteCategories;
    this.wasteTypes.map(c => c == 'waste' ? 'Trash & Yard' : c)
      .map(c => c.charAt(0).toUpperCase() + c.slice(1)) //cap first letter
      .forEach((type, i) => {
      alert.addInput({
        type: 'checkbox',
        label: type,
        value: this.wasteTypes[i],
        checked: active.indexOf(this.wasteTypes[i]) >= 0
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: data => {
        console.log('selected hour', data);
        this.setHour(data);
      }
    });
    this.nav.present(alert);
  }
  setTimeOfDay(time) {
    this.timeOfDay = time;
   // this.timeOfDayPopOver.hide();
  }

  setHour(hour) {
    this.hour = hour;
   // this.hourPopOver.hide();
  }

  setupReminders() {
    getPlugin('notification').local.clearAll(() => {
      //clear all notifications then start again

      this.schedulerService.init(this.pos, 365);
      this.schedulerService.whenLoaded.then(() => {
        this.notificationsEnabled = true;
        window.localStorage.setItem('notificationsEnabled', 'true');
        this.notificationsData = {
          position: this.pos,
          timeOfDay: this.timeOfDay,
          categories: this.activeWasteCategories,
          hour: this.hour
        };
        window.localStorage.setItem('notificationsData', JSON.stringify(this.notificationsData));

        var notifications = _(this.schedulerService.events).map((event) => {
          var isNight = this.timeOfDay == 'night';
          var date = event.day.clone()
            .add(isNight ? -1 : 0, 'day')
            .set('hour', isNight ? this.hour + 12 : this.hour)
            .startOf('hour')
            .set('minute', 0)
            .toDate();

          var matches = _.intersection(event.categories, this.activeWasteCategories);

          if (matches.length) {
            return {
              id: date.getTime(),
              text: "Don't forget to rollout your " + this.makeDescriptionText(matches),
              at: date.getTime()
            };
          }
        }).compact().value();
        console.log('creating notifications', notifications);
        getPlugin('notification').schedule(notifications);

        this.pickupDays = this.schedulerService.pickupDays;
       // this.$ionicLoading.hide();
       // this.$ionicHistory.goBack();
      }).catch(()=> {
        console.log(arguments);
       // this.$ionicLoading.hide();
/*
        this.alert('Unable to Find Your Schedule. ' +
          'Make Sure You Are Connected to the Internet');
*/
      });
     /* this.$ionicLoading.show({
        template: 'Creating Your Reminders'
      });*/

    })
  }

  makeDescriptionText(categories) {
    //FIXME: lazy hack because i want it to say trash instead of waste on the reminder but don't want to rewrite all the reminder code
    categories = categories.map(c => c == 'waste' ? 'trash' : c);
    var description = "nothing";
    if (categories.length == 1)
      description = categories[0];
    else if (categories.length == 2)
      description = categories[0] + ' and ' + categories[1];
    else if (categories.length >= 3)
      description = categories.splice(0, categories.length - 1).join(', ') + ' and ' + categories[categories.length - 1];
    return description;
  }

  get activeWasteCategories() {
    return _(this.wasteTypes).map((i)=> {
        return this[i] ? i : null
      }).compact().value();
  }
}
