export class HomeCtrl {
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

    constructor($scope, $ionicPlatform, $ionicLoading, alert, $ionicFilterBar, $timeout, GeoLocation, SchedulerService, localStorageService) {
        angular.extend(this, {
            $scope,
            $ionicPlatform,
            $ionicLoading,
            SchedulerService,
            alert,
            $ionicFilterBar,
            $timeout,
            GeoLocation
        });
        ionic.Platform.ready(this.checkForUpdates.bind(this));
        this.$scope.moment = moment;
        this.$scope.filterItems = function () {
            console.log('heard filter', arguments);
        };
        this.loadEvents();
    }

    checkForUpdates() {
        /*
        this.$ionicDeploy.check().then((response) => {
                console.log('checking for updates', response);
                // response will be true/false
                if (response) {
                    // Download the updates
                    this.$ionicDeploy.download().then(() => {
                        console.log('downloading updates');
                        // Extract the updates
                        this.$ionicDeploy.extract().then(() => {
                            // Load the updated version
                            this.$ionicDeploy.load();
                            console.log('loading new version');
                        }, (error) => {
                            console.log('error extracting');
                            // Error extracting
                        }, ()=> {
                            console.log('extract in progress');
                        });
                    }, (error) => {
                        // Error downloading the updates
                        console.log('error downloading', error);
                    }, (progress)=> {
                        // Do something with the download progress
                        console.log('check in progress?');
                    });
                }
            },
            (error)=> {
                console.log('error checking for updates', error);
            })*/
    }

    showFilterBar() {
        this.filterBarInstance = this.$ionicFilterBar.show({
            placeholder: 'Your Address',
            debounce: true,
            items: [],
            cancel: () => this.addresses = null,
            filter: (items, str) => {
                if (str.length <= 3) {
                    this.addresses = null;
                    return;
                }
                this.GeoLocation.lookupAddress(str).then((results) => {
                    this.addresses = results;
                });
            }
        });
    }

    selectAddress(suggestion) {
        this.addresses = null;
        this.filterBarInstance();
        this.$timeout(()=>this.GeoLocation.lookupCoordinates(suggestion).then(this.loadEventsForPosition.bind(this)))

    }

    loadEventsForPosition(pos) {
        //data format from arcgis is all over the place, need to standardize this to prevent headaches :-/
        if(pos.x && !pos.coords) {
            pos.coords = {
                latitude: pos.y,
                longitude: pos.x
            };

            console.log('fixing coords', pos)
        }
        this.coords = pos.coords;

        var scheduler = this.SchedulerService(pos, 90);
        scheduler.whenLoaded.then(() => {
            this.events = scheduler.events;
            this.pickupDays = scheduler.pickupDays;
            console.log(this.events);
            this.$ionicLoading.hide();
        }).catch(()=> {
            console.error(arguments);
            this.$ionicLoading.hide();
            this.alert('Unable to Find Your Schedule. ' +
                'Make Sure You Are Connected to the Internet, and are in Houston');
        });
    }

    loadEvents() {
        this.$ionicLoading.show({
            template: 'Finding Your Location'
        });

        ionic.Platform.ready(() => {
            this.$ionicLoading.show({
                template: 'Looking Up Your Schedule'
            });
            navigator.geolocation.getCurrentPosition((pos) => {
                this.loadEventsForPosition(pos);
            }, (err) => {
                console.error(arguments);
                this.$ionicLoading.hide();
                this.showFilterBar();
            });
        });
    }
}