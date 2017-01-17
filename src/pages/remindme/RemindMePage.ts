import {NavParams, NavController, Alert, Loading, AlertController, LoadingController} from "ionic-angular";
import {Scheduler} from "../../common/Scheduler";
import _ from "lodash";
import {Component} from "@angular/core";
import {TranslateService} from "ng2-translate";

interface Window {
  cordova:any;
}


@Component({
  templateUrl: 'RemindMePage.html',
  providers: [Scheduler],
})
export class RemindMePage {
  notificationsEnabled:boolean = false;
  notificationsData:any = false;
  timeOfDay = 'morning';
  hour = 6;
  whatDescription:String;
  loadingContent:Loading;
  localizedText = {};

  private wasteTypes = ['recycling', 'waste', 'tree', 'junk'];
  private selectedWasteTypes = ['recycling', 'waste'];

  private pos:any;
  private pickupDays;
  private block = false;

  constructor(
      private loadingController:LoadingController,
      private alertController:AlertController,
      private nav:NavController,
      private navParams:NavParams,
      private schedulerService:Scheduler,
      private translate:TranslateService
  ) {
    this.notificationsEnabled = window.localStorage.getItem('notificationsEnabled') == 'true';
    this.notificationsData = JSON.parse(window.localStorage.getItem('notificationsData') || "{}");
    this.pos = {x: navParams.get('longitude'), y: navParams.get('latitude')};

    translate.get([
      'When',
      'When_Should_Rollout_Alert_You',
      'In_The_Morning_AM',
      'At_Night_PM',
      'What_Time',
      'Cancel',
      'What_Types',
      'Creating_Reminders',
      'You_Enabled_Reminders_For_Rollout',
      'Sorry_There_Was_A_Problem_Setting_Up_Your_Reminders',
      'In_The_Morning',
      'At_Night',
      'Nothing',
      'recycling',
      'trash',
      'tree',
      'junk',
      'and',
    ]).subscribe(res => {
      this.localizedText['when'] = res.When;
      this.localizedText['whenShouldRolloutAlertYou'] = res['When_Should_Rollout_Alert_You'];
      this.localizedText['inTheMorningAM'] = res['In_The_Morning_AM'];
      this.localizedText['atNightPM'] = res['At_Night_PM'];
      this.localizedText['whatTime'] = res['What_Time'];
      this.localizedText['cancel'] = res['Cancel'];
      this.localizedText['whatTypes'] = res['What_Types'];
      this.localizedText['creatingReminders'] = res['Creating_Reminders'];
      this.localizedText['youEnabledRemindersForRollout'] = res['You_Enabled_Reminders_For_Rollout'];
      this.localizedText['sorryThereWasAProblemSettingUpYourReminders'] = res['Sorry_There_Was_A_Problem_Setting_Up_Your_Reminders'];
      this.localizedText['inTheMorning'] = res['In_The_Morning'];
      this.localizedText['atNight'] = res['At_Night'];
      this.localizedText['nothing'] = res['Nothing'];
      this.localizedText['recycling'] = res['recycling'];
      this.localizedText['trash'] = res['trash'];
      this.localizedText['tree'] = res['tree'];
      this.localizedText['junk'] = res['junk'];
      this.localizedText['and'] = res['and'];
    });
  }

  ionViewDidLoad() {
    this.whatDescription = this.makeDescriptionText(this.selectedWasteTypes);
  }

  unblock():void {
    //there is an ionic2 bug with the modals receiving click events... this is a hack to fix this
    this.block = true;
    setTimeout(()=>this.block = false, 300);
  }
  openTimeOfDay() {
    if(this.block) return;
    this.block = true;
    let confirm = this.alertController.create({
      title: this.localizedText['when'],
      message: this.localizedText['whenShouldRolloutAlertYou'],
      buttons: [
        {
          text: this.localizedText['inTheMorningAM'],
          handler: () => {
            this.timeOfDay = 'morning';
          }
        },
        {
          text: this.localizedText['atNightPM'],
          handler: () => {
            this.timeOfDay = 'night'
          }
        }
      ]
    });
    confirm.onDidDismiss(() => this.unblock());
    confirm.present();
  }

  openHours() {
    if(this.block) return;
    this.block = true;
    let alert:Alert = this.alertController.create({
      title: this.localizedText['whatTime'],
    });

    _.range(5, 11).forEach((num) => {
      alert.addInput({
        type: 'radio',
        label: num.toString(),
        checked: this.hour === num,
        value: num.toString()
      });
    });
    alert.addButton({text: this.localizedText['cancel'], handler: () => this.unblock()});
    alert.addButton({
      text: 'Ok',
      handler: data => {
        console.log('selected hour', data);
        this.hour = parseInt(data);

      }
    });
    alert.present();
    alert.onDidDismiss(() => this.unblock());
  }

  openWhat() {
    if(this.block) return;
    this.block = true;
    let alert = this.alertController.create({
      title: this.localizedText['whatTypes']
    });

    this.wasteTypes.map(c => c == 'waste' ? 'Trash & Yard' : c)
      .map(c => c.charAt(0).toUpperCase() + c.slice(1)) //cap first letter
      .forEach((type, i) => {
        console.log('type', this.selectedWasteTypes.indexOf(this.wasteTypes[i]), this.selectedWasteTypes);
        alert.addInput({
          type: 'checkbox',
          label: type,
          value: this.wasteTypes[i],
          checked: this.selectedWasteTypes.indexOf(this.wasteTypes[i]) >= 0
        });
      });
    alert.addButton({text: this.localizedText['cancel'], handler: () => this.unblock()});
    alert.addButton({
      text: 'Ok',
      handler: data => {
        console.log('selected waste types', this.selectedWasteTypes);
        this.selectedWasteTypes = data;
        this.whatDescription = this.makeDescriptionText(data);

      }
    });
    alert.onDidDismiss(() => this.unblock());
    alert.present();
  }

  setupReminders() {
    var notificationPlugin:any = null;
    if (!window.cordova) {
      console.log('cordova is not found, maybe you are running in browser?. Building a shim.');
      const noopCallback = (r) => r instanceof Function ? r() : true;
      notificationPlugin = {clearAll: noopCallback, schedule: noopCallback};
    } else {
      const plugins:any = cordova.plugins;
      notificationPlugin = plugins.notification.local;
    }
    this.loadingContent = this.loadingController.create({content: this.localizedText['creatingReminders']});
    this.loadingContent.present();
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
        notifications.push({
          id: 0,
          text: this.localizedText['youEnabledRemindersForRollout'],
          at: new Date(new Date().getTime() + 5000)
        });
        console.log('creating notifications', notifications);

        notificationPlugin.schedule(notifications);

        this.pickupDays = this.schedulerService.pickupDays;
        this.loadingContent.dismiss().then(() => {
          this.nav.pop();
        });
      }).catch(() => {
        this.loadingController.create({ content: this.localizedText['sorryThereWasAProblemSettingUpYourReminders'] });
        console.log(arguments);
      });
    })
  }

  makeDescriptionText(categories) {
    //FIXME: lazy hack because i want it to say trash instead of waste on the reminder but don't want to rewrite all the reminder code
    categories = categories.map(c => c == 'waste' ? 'trash' : c);
    var description = this.localizedText['nothing'];
    if (categories.length == 1)
      description = this.localizedText[categories[0]];
    else if (categories.length == 2)
      description = `${this.localizedText[categories[0]]}, ${this.localizedText['and']} ${this.localizedText[categories[1]]}`;
    else if (categories.length == 3)
      description = `${this.localizedText[categories[0]]}, ${this.localizedText[categories[1]]}, ${this.localizedText['and']} ${this.localizedText[categories[2]]}`;
    else if (categories.length == 4)
      description = `${this.localizedText[categories[0]]}, ${this.localizedText[categories[1]]}, ${this.localizedText[categories[2]]}, ${this.localizedText['and']} ${this.localizedText[categories[3]]}`;
    return description;
  }

  morningNightText() {
    return this.timeOfDay === 'morning' ? this.localizedText['inTheMorning'] : this.localizedText['atNight'];
  }
}
