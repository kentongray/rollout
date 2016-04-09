import {Page, Platform, NavController, Loading} from "ionic-angular";
import {AddressLookup} from "../../common/AddressLookup";
import {Scheduler} from "../../common/Scheduler";
import {Geolocation} from "ionic-native";
import * as moment from "moment";
import {DayOfWeekPipe, RelativeDatePipe} from "../../common/Pipes";
import {RemindMePage} from "../remindme/RemindMePage";

@Page({
  providers: [Scheduler, AddressLookup],
  pipes: [DayOfWeekPipe, RelativeDatePipe],
  templateUrl: 'build/pages/home/HomePage.html'
})
export default class HomePage {
  private addresses;
  private searchQuery = "";
  private searching:Boolean;

  events = [];
  private SchedulerService:Scheduler;
  private coords;
  private geolocation:Geolocation;
  private pickupDays:Array<any>;
  private moment;
  private addressLookup;
  private loadingMessage:String;
  private errorMessage:String;
  private loadingContent:Loading;
  private loading:boolean;

  constructor(private platform:Platform, private nav: NavController, private SchedulerService:Scheduler, addressLookup:AddressLookup ) {
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
    this.addressLookup.lookupCoordinates(suggestion).then(this.loadEventsForPosition.bind(this));
  }

  searchAddress(str) {
    if (str.length <= 3) {
      this.addresses = null;
      return;
    }
    this.addressLookup.lookupAddress(str).then((results) => {
      console.log('address results', results);
      this.addresses = results;
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
    if(!this.loadingContent) {
      this.loadingContent = Loading.create({content:str});
    }

    //hack see: https://github.com/driftyco/ionic/issues/6103
    this.loadingContent.data.content = str;
    if(!this.loading) {
      this.nav.present(this.loadingContent);
      this.loading = true;
    }
  }

  hideLoader() {
    this.loading = false;
    this.loadingContent.dismiss();
  }
  loadEvents() {
    this.showLoader('Starting Up!');
    this.platform.ready().then(() => {
      /* this.$ionicLoading.show({
       template: 'Looking Up Your Schedule'
       });*/
      this.showLoader('Finding Your Location');
      return this.geolocation.getCurrentPosition()
        .then(pos =>  {
          this.showLoader('Looking Up Your Schedule!');
          return pos;
        }, this.errorFindingPosition.bind(this))
        .then(this.loadEventsForPosition.bind(this))
        .catch(pos => {
          this.showError('Problem Loading Your Schedule');
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
