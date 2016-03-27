import {Page, Platform} from "ionic-framework/ionic";
import * as moment from "moment";
import {NavParams} from "ionic-angular/index";
import {getPlugin} from "ionic-native/dist/plugins/plugin";
import {Scheduler} from "../../common/Scheduler";
import {LocalStorage} from "angular2-localstorage/LocalStorage";

@Page({
  templateUrl: 'build/pages/remindme/RemindMe.html',
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
  constructor(private navParams: NavParams, private schedulerService:Scheduler) {
    console.log(this.navParams, 'sp');
    this.notificationsEnabled =  localStorage.get('notificationsEnabled') == 'true';
    this.notificationsData =  JSON.parse(localStorage.get('notificationsData') || "{}");
    this.pos = {x: navParams.get('longitude'), y: navParams.get('latitude')};a
/*
    $scope.$watchGroup(this.wasteTypes.map((i)=> 'remind.' + i), () => {
      var whats = this.activeWasteCategories();
      this.whatDescription = this.makeDescriptionText(whats);
    });*/

    var timeOfDayTemplate = `<ion-popover-view ><ul class="list">
            <li class="item" ng-click="remind.setTimeOfDay('morning')">
            Morning
            </li>
            <li class="item" ng-click="remind.setTimeOfDay('night')">
            Night
            </li>
        </ul></ion-popover-view>`;

    var hourTemplate = `<ion-popover-view ><ul class="list">
            <li class="item" ng-click="remind.setHour(5)">
            5
            </li>
            <li class="item" ng-click="remind.setHour(6)">
            6
            </li>
            <li class="item" ng-click="remind.setHour(7)">
            7
            </li>
            <li class="item" ng-click="remind.setHour(8)">
            8
            </li>
            <li class="item" ng-click="remind.setHour(9)">
            9
            </li>
            <li class="item" ng-click="remind.setHour(10)">
            10
            </li>
        </ul></ion-popover-view>`;

    var whatTemplate = `<ion-popover-view>
           <ion-toggle ng-model="remind.recycling" toggle-class="toggle-calm">Recycling</ion-toggle>
           <ion-toggle ng-model="remind.waste" toggle-class="toggle-calm">Trash & Yard</ion-toggle>
           <ion-toggle ng-model="remind.junk" toggle-class="toggle-calm">Junk</ion-toggle>
           <ion-toggle ng-model="remind.tree" toggle-class="toggle-calm">Tree Trash</ion-toggle>
        </ion-popover-view>`;
/*
    this.timeOfDayPopOver = $ionicPopover.fromTemplate(timeOfDayTemplate, {
      scope: $scope
    });
    this.hourPopOver = $ionicPopover.fromTemplate(hourTemplate, {
      scope: $scope
    });
    this.whatPopOver = $ionicPopover.fromTemplate(whatTemplate, {
      scope: $scope
    });*/


  }

  setTimeOfDay(time) {
    this.timeOfDay = time;
   // this.timeOfDayPopOver.hide();
  }

  setHour(hour) {
    this.hour = hour;
   // this.hourPopOver.hide();
  }

  safeApply(fn) {
   /* if (!this.$scope.$$phase) {
      this.$scope.$apply(fn);
    } else {
      fn();
    }*/
  }

  setupReminders() {
    getPlugin('notification').local.clearAll(() => {
      //clear all notifications then start again

      this.schedulerService.init(this.pos, 365);
      this.schedulerService.whenLoaded.then(() => {
        this.notificationsEnabled = true;
        localStorage.setItem('notificationsEnabled', 'true');
        this.notificationsData = {
          position: this.pos,
          timeOfDay: this.timeOfDay,
          categories: this.activeWasteCategories(),
          hour: this.hour
        };
        localStorage.setItem('notificationsData', JSON.stringify(this.notificationsData));

        var notifications = _(this.schedulerService.events).map((event) => {
          var isNight = this.timeOfDay == 'night';
          var date = event.day.clone()
            .add(isNight ? -1 : 0, 'day')
            .set('hour', isNight ? this.hour + 12 : this.hour)
            .startOf('hour')
            .set('minute', 0)
            .toDate();

          var matches = _.intersection(event.categories, this.activeWasteCategories());

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

  activeWasteCategories() {
    return _(this.wasteTypes).map((i)=> {
        return this[i] ? i : null
      }).compact().value();
  }
}
