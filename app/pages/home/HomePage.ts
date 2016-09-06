import {Platform, NavController, Loading, LoadingController} from "ionic-angular";
import {AddressLookup} from "../../common/AddressLookup";
import {Scheduler, PickupDay} from "../../common/Scheduler";
import {Geolocation} from "ionic-native";
import * as moment from "moment";
import {DayOfWeekPipe, RelativeDatePipe} from "../../common/Pipes";
import {RemindMePage} from "../remindme/RemindMePage";
import Focuser from "../../common/Focuser";
import {Component} from "@angular/core";

@Component({
  providers: [Scheduler, AddressLookup],
  directives: [Focuser],
  pipes: [DayOfWeekPipe, RelativeDatePipe],
  templateUrl: 'build/pages/home/HomePage.html'
})
export default class HomePage {
  private addresses;
  private searchQuery = "";
  private searching:Boolean;

  events = [];
  private coords;
  private geolocation:Geolocation;
  private pickupDays:PickupDay;
  private moment;
  private addressLookup;
  private loadingMessage:String;
  private errorMessage:String;
  private loadingContent:Loading;
  private loading:boolean;
  private currentSearch:String;

  constructor(private loadingController:LoadingController, private platform:Platform, private nav:NavController, private SchedulerService:Scheduler, addressLookup:AddressLookup) {
    this.moment = moment;
    this.geolocation = Geolocation;
    this.addressLookup = addressLookup;
    this.loadEvents();
  }

  showFilterBar() {
    this.searching = true;
  }

  selectAddress(suggestion) {
    this.searching = false;
    this.addresses = null;
    this.showLoader('Looking up Coordinates');
    this.addressLookup.lookupCoordinates(suggestion)
      .then(r => {
        this.showLoader('Looking up Schedule');
        return this.loadEventsForPosition(r);
      })
      .then(r => {
        this.hideLoader();
        return r;
      })
      .catch(e => {
        this.showError("Error Looking Up Address");
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

  goToRemindMe() {
    this.nav.push(RemindMePage, {
      x: this.coords.latitude,
      y: this.coords.longitude,
    });
  }

  static dateFilter(day) {
    if (moment().isSame(day, 'day')) {
      return 'Today ' + day.format('MMM Do');
    } else if (moment().add(1, 'days').isSame(day, 'day')) {
      return 'Tomorrow ' + day.format('MMM Do');
    } else {
      return day.format('dddd MMM Do');
    }
  }

  static dayOfWeek(day) {
    return moment().day(day).format("dddd");
  }

  showLoader(str = 'One Sec!') {
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

  codePushStatusUpdate(completeCallback, errorCallback) {

    let syncStatusCallback = (syncStatus) => {
      switch (syncStatus) {
        // Result (final) statuses
        case SyncStatus.UPDATE_INSTALLED:

          alertFn('The update was installed successfully.', null, 'Success!');

          // force clean slate after codepush update
          // completelyDestroyEverything();

          break;
        case SyncStatus.UP_TO_DATE:

          // alertFn('The application is up to date.');
          break;
        case SyncStatus.UPDATE_IGNORED:

          // alertFn('The user decided not to install the optional update.');
          break;
        case SyncStatus.ERROR:
          $ionicLoading.hide();
          alertFn('An error occured while checking for updates', null, 'Error');
          break;

        // Intermediate (non final) statuses
        case SyncStatus.CHECKING_FOR_UPDATE:
          console.log('Checking for update.');
          break;
        case SyncStatus.AWAITING_USER_ACTION:
          console.log('Alerting user.');
          break;
        case SyncStatus.DOWNLOADING_PACKAGE:

          $ionicLoading.show({
            template: `Downloading...<br />
              <progress id="update-app-progress" max="1" value="0"></progress>`
          });
          console.log('Downloading package.');
          break;
        case SyncStatus.INSTALLING_UPDATE:
          $ionicLoading.hide();
          $ionicLoading.show({
            template: `Installing...`
          });
          console.log('Installing update');
          break;
      }
    };
  }

  loadEvents() {
    this.showLoader('Starting Up!');
    this.platform.ready().then(() => {

      let updatePromise;
      if (window.codePush) {
        this.showLoader('Checking For Updates');
        //updatePromise = window.codePush.sync(null, {updateDialog: true});
        updatePromise = Promise.resolve();
        console.log('code push complete');
      } else {
        updatePromise = Promise.resolve();
      }
      return updatePromise
        .then(() => this.showLoader('Finding Your Location'))
        .then(() => this.geolocation.getCurrentPosition())
        .then(pos => {
          this.showLoader('Looking Up Your Schedule!');
          return pos;
        }, this.errorFindingPosition.bind(this))
        .catch(err => {
          console.error(err);
          this.hideLoader();
          this.showError('Whoops! We couldn\'t look up your location.');
        })
        .then(this.loadEventsForPosition.bind(this))
        .catch(pos => {
          this.hideLoader();
          this.showError('Ak! We Had a Problem Loading Your Schedule. \nThe City of Houston servers may be down :(');
        });
    }).then(this.hideLoader.bind(this), this.hideLoader.bind(this));
  }

  errorFindingPosition(err) {
    this.showError('Error Finding Position');
    console.error('Error Finding Position', err);
  }

  showError(errorMessage) {
    this.hideLoader();
    this.errorMessage = errorMessage;
  }

  clearError():void {
    this.hideLoader();
    delete this.errorMessage;
  }

  retry():Promise<Array<any>> {
    this.showLoader('Trying again');
    this.clearError();
    console.log('reloading');
    return this.loadEventsForPosition({coords: this.coords}).then(r => {
      this.hideLoader();
      return r
    });
  }

  loadEventsForPosition(pos):Promise<Array<any>> {
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
      this.pickupDays = this.SchedulerService.pickupDays;
      return this.events;
      this.hideLoader();
    });
  }
}
