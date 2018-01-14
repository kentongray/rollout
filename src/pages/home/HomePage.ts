import {Content, Loading, LoadingController, NavController, Platform, ToastController} from "ionic-angular";
import {AddressLookup} from "../../common/AddressLookup";
import {Notification, PickupDay, Scheduler} from "../../common/Scheduler";
import {Geolocation} from "ionic-native";
import moment from "moment";
import {RemindMePage} from "../remindme/RemindMePage";
import {Component, ViewChild} from "@angular/core";
import {HandledPromiseError, rejectFirst} from "../../common/PromiseExceptionHandler";
import {DetailPage} from "../detail/DetailPage";
import {UrlUtil} from "../../common/UrlUtil";
import {TranslateService} from "@ngx-translate/core";
import {toCamelCase} from "../../common/SnakeToCamel";

@Component({
  templateUrl: 'HomePage.html'
})
export class HomePage {
  @ViewChild(Content) content: Content;
  private coords;
  private pickupDays: PickupDay;

  moment;
  addresses;
  searching: Boolean;
  events: any[] = [];
  notifications: Notification[];
  errorMessage?: string;
  loadingContent: Loading;
  loading: boolean = false;
  currentSearch: string;
  translatedText = {};

  constructor(public toastCtrl: ToastController,
              private loadingController: LoadingController,
              private platform: Platform,
              private nav: NavController,
              private SchedulerService: Scheduler,
              private addressLookup: AddressLookup,
              private translate: TranslateService) {
    this.moment = moment;
  }

  ionViewWillEnter() {
    this.searching = false;
  }
  ngOnInit() {
    const splashscreen = (<any> navigator).splashscreen;
    if(splashscreen)
      splashscreen.hide();
    const keys = [
      'We_Had_A_Problem_Loading_Your_Schedule_The_City_Of_Houston_May_Be_Having_Issues',
      'You_Can_Now_Tap_The_Types_Of_Trash_To_Learn_More',
      'Looking_Up_Coordinates',
      'Unable_To_Locate_You',
      'Looking_Up_Your_Schedule',
      'Error_Loading_Events',
      'Starting_Up',
      'Finding_Your_Location',
      'We_Couldnt_Look_Up_Your_Location_Check_Your_Location_Permissions',
      'Something_Went_Wrong',
      'Error_Finding_Position',
      'Try_Again',
      'One_Sec',
    ];
    this.translate.get(keys).subscribe(res => {
      keys.forEach(k => {
        this.translatedText[toCamelCase(k)] = res[k];
      })
    }, console.error, () => {
      console.log('done with translations');
      this.announceUpdates();
      this.loadEvents();
    });
  }

  announceUpdates() {
    if (!window.localStorage.getItem('announcedTapTypes')) {
      window.localStorage.setItem('announcedTapTypes', true.toString());
      let toast = this.toastCtrl.create({
        message: this.translatedText['youCanNowTapTheTypesOfTrashToLearnMore'],
        showCloseButton: true,
        duration: 20000,
      });
      toast.present();
    }
  }

  openHolidaySchedule() {
    UrlUtil.openUrl('http://www.houstontx.gov/solidwaste/holiday.html');
  }

  tapNotification(notification:Notification) {
    UrlUtil.openUrl(notification.link);
  }

  showFilterBar() {
    this.content.scrollToTop();
    this.searching = true;
  }

  lookupCurrentLocation() {
    this.searching = false;
    this.addresses = null;
    this.loadEvents();
  }

  selectAddress(suggestion) {
    this.clearError();
    this.searching = false;
    this.addresses = null;
    this.showLoader(this.translatedText['lookingUpCoordinates']);
    this.addressLookup.lookupCoordinates(suggestion)
      .then(r => {
        this.showLoader(this.translatedText['lookingUpYourSchedule']);
        return this.loadEventsForPosition(r);
      }, e => this.showError(this.translatedText['unableToLocateYou']))
      .then(r => {
        this.hideLoader();
        return r;
      }, e => this.showError(this.translatedText['errorLoadingEvents'], e))
      .catch(e => {
        this.hideLoader();
        throw "Error Loading Events";
      });
  }

  searchAddress(str) {
    console.log('searching for ', str);
    if (str.length <= 2) {
      this.addresses = null;
      return;
    }
    this.currentSearch = str;
    this.addressLookup.lookupAddress(str).then((results) => {
      //deal with variable loading times, we create a token to make sure we are only showing the latest results
      if (str === this.currentSearch) {
        console.log('address results', results, str, this.currentSearch);
        this.addresses = results;
      }
      else {
        console.log('ignoring slow result', str, this.currentSearch);
      }
    });
  }

  goToDetails(category) {
    console.log(category, 'category go!');
    this.nav.push(DetailPage, {
      category: category
    });
  }

  goToRemindMe() {
    this.nav.push(RemindMePage, {
      latitude: this.coords.latitude,
      longitude: this.coords.longitude,
    });
  }

  static dayOfWeek(day) {
    return moment().day(day).format("dddd");
  }

  showLoader(str = this.translatedText['oneSec']) {
    if (!this.loadingContent) {
      this.loadingContent = this.loadingController.create({content: str});
    }

    //hack see: https://github.com/driftyco/ionic/issues/6103
    this.loadingContent.data.content = str;
    if (!this.loading) {
      this.loadingContent.present();
      this.loading = true;
    }
  }

  hideLoader() {
    this.loading = false;
    if (this.loadingContent) {
      this.loadingContent.dismiss();
      this.loadingContent = null;
    }
  }

  loadEvents(): Promise<any> {
    console.log('loading events');
    this.showLoader(this.translatedText['startingUp']);
    return this.platform.ready().then(() => {
        console.log('ready');
        this.showLoader(this.translatedText['findingYourLocation']);
        return Geolocation.getCurrentPosition({maximumAge: 3000, timeout: 30000, enableHighAccuracy: true})
          .then(pos => {
            console.log('got the geo');
            this.showLoader(this.translatedText['lookingUpYourSchedule']);
            return pos;
          }, rejectFirst(this.translatedText['weCouldntLookUpYourLocationCheckYourLocationPermissions']))
          .then(this.loadEventsForPosition.bind(this), rejectFirst(this.translatedText['errorLoading']))
      }
    )
      .catch(this.promiseCatcher)
      .then(this.hideLoader.bind(this));
  }

  // meant to be used in conjunction with promise utils to display the error of the first promise
  // written in this way to bind(this)
  promiseCatcher = (error: any): void => {
    console.log('error happened?', error, error instanceof HandledPromiseError, error.causedBy);
    if (error.handledPromiseError) {
      this.showError(error.message)
    }
    else {
      console.warn('showing a generic error, we can do better right', error);
      window['blah'] = error;
      this.showError(this.translatedText['somethingWentWrong']);
    }
    return this.hideLoader();
  };


  errorFindingPosition(err) {
    this.showError(this.translatedText['errorFindingPosition']);
    console.error('Error Finding Position', err);
  }

  showError(errorMessage, e: Error = null) {
    console.error(errorMessage, e);
    this.hideLoader();
    this.errorMessage = errorMessage;
  }

  clearError(): void {
    console.log('clearing loader');
    this.hideLoader();
    this.errorMessage = null;
  }

  retry(): Promise<any> {
    this.clearError();
    this.showLoader(this.translatedText['tryAgain']);
    console.log('reloading', this.coords);
    if (!this.coords) {
      //if no coords try to geolocate again
      return this.loadEvents();
    }
    else {
      //they might have put in a custom address so try to look up the same ones
      return this.loadEventsForPosition({coords: this.coords})
        .catch(rejectFirst(this.translatedText['errorLoading']))
        .then(r => {
          console.log('hiding that loader');
          this.hideLoader();
          return r
        }, this.promiseCatcher);
    }
  }

  loadEventsForPosition(pos): Promise<Array<any>> {
    console.log('im not here right');
    //data format from arcgis is all over the place, need to standardize this to prevent headaches :-/
    if (pos.x && !pos.coords) {
      pos.coords = {
        latitude: pos.y,
        longitude: pos.x
      };

    }
    this.coords = pos.coords;
    this.SchedulerService.init(pos, 90);

    return this.SchedulerService.whenLoaded.then(() => {
      this.events = this.SchedulerService.events;
      this.sendNotifications(this.SchedulerService.notifications);
      this.pickupDays = this.SchedulerService.pickupDays;
      console.log('all done');
      this.hideLoader();
      return this.events;
    });
  }

  private sendNotifications(notifications: Notification[]) {
    console.log("notifications", notifications);
    // filter out old events and show the current ones
    this.notifications = notifications.filter(n => n.expiresOn.isAfter(moment()))
  }
}
