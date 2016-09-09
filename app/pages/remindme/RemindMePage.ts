import {NavParams, NavController, Alert, Loading, AlertController, LoadingController} from "ionic-angular";
import {Scheduler} from "../../common/Scheduler";
import * as _ from "lodash";
import {Component} from "@angular/core";


@Component({
  templateUrl: 'build/pages/remindme/RemindMePage.html',
  providers: [Scheduler],
})
export class RemindMePage {
  public notificationsEnabled:boolean = false;
  public notificationsData:any = false;
  private timeOfDay = 'morning';
  private wasteTypes = ['recycling', 'waste', 'tree', 'junk'];
  private selectedWasteTypes = ['recycling', 'waste'];
  private recycling = true;
  private waste = true;
  private junk = false;
  private hour = 6;
  private pos:any;
  private whatDescription:String;
  private loadingContent:Loading;
  private pickupDays;

  constructor(private loadingController:LoadingController, private alertController:AlertController, private nav:NavController, private navParams:NavParams, private schedulerService:Scheduler) {
    this.notificationsEnabled = window.localStorage.getItem('notificationsEnabled') == 'true';
    this.notificationsData = JSON.parse(window.localStorage.getItem('notificationsData') || "{}");
    this.pos = {x: navParams.get('longitude'), y: navParams.get('latitude')};
    this.whatDescription = this.makeDescriptionText(this.selectedWasteTypes);

  }

  openTimeOfDay() {
    let confirm = this.alertController.create({
      title: 'When?',
      message: 'When Should Rollout! Alert You?',
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
    confirm.present();
  }

  openHours() {
    let alert:Alert = this.alertController.create({
      title: 'What Time?'
    });

    _.range(5, 11).forEach((num) => {
      alert.addInput({
        type: 'radio',
        label: num.toString(),
        checked: this.hour === num,
        value: num.toString()
      });
    });
    alert.addButton('Cancel');
    alert.addButton({
      text: 'Ok',
      handler: data => {
        console.log('selected hour', data);
        this.hour = parseInt(data);
      }
    });
    alert.present();
  }

  openWhat() {
    let alert = this.alertController.create({
      title: 'What Types?'
    });

    var active = this.selectedWasteTypes;
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
        this.selectedWasteTypes = data;
        this.whatDescription = this.makeDescriptionText(data);
      }
    });
    alert.present();
  }

  setupReminders() {
    if(!window.cordova) {
      console.log('cordova is not found, maybe you are running in browser?. Going back.')
      this.nav.pop();

      return;
    }
    this.loadingContent = this.loadingController.create({content: "Creating Reminders"});
    this.loadingContent.present();
    const notificationPlugin:any = cordova.plugins.notification.local;
    notificationPlugin.clearAll(() => {
      console.log('all notifications cleared');
      //clear all notifications then start again
      console.log(this.pos, 'current pos');
      this.schedulerService.init(this.pos, 365);
      this.schedulerService.whenLoaded.then(() => {
        this.notificationsEnabled = true;
        window.localStorage.setItem('notificationsEnabled', 'true');
        this.notificationsData = {
          position: this.pos,
          timeOfDay: this.timeOfDay,
          categories: this.selectedWasteTypes,
          hour: this.hour
        };
        window.localStorage.setItem('notificationsData', JSON.stringify(this.notificationsData));

        var notifications = _(this.schedulerService.events).map((event) => {
          console.log(event);
          var isNight = this.timeOfDay == 'night';
          var date = event.day.clone()
            .add(isNight ? -1 : 0, 'day')
            .set('hour', isNight ? this.hour + 12 : this.hour)
            .startOf('hour')
            .set('minute', 0)
            .toDate();

          var matches = _.intersection(event.categories, this.selectedWasteTypes);

          if (matches.length) {
            return {
              id: date.getTime(),
              text: "Don't forget to rollout your " + this.makeDescriptionText(matches),
              at: date.getTime()
            };
          }
        }).compact().value();
        console.log('creating notifications', notifications);
        notificationPlugin.schedule(notifications);

        this.pickupDays = this.schedulerService.pickupDays;
        this.loadingContent.dismiss().then(() => {
          this.nav.pop();
        });
      }).catch(function() {
        alert('Sorry there was a problem setting up your reminders');
        console.log(arguments);
      });
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
}
