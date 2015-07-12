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

    constructor($scope, $ionicPlatform, $ionicLoading, SchedulerService) {
        angular.extend(this, {$scope, $ionicPlatform, $ionicLoading, SchedulerService});
        this.$scope.moment = moment;
        this.loadEvents();
    }

    loadEvents() {
        this.$ionicLoading.show({
            template: 'Finding Your Location'
        });

        this.$ionicPlatform.ready(() => {
            this.$ionicLoading.show({
                template: 'Looking Up Your Schedule'
            });
            navigator.geolocation.getCurrentPosition((pos) => {
                var scheduler = this.SchedulerService(pos, 60);
                scheduler.whenLoaded.then(() => {
                    this.events = scheduler.events;
                    this.pickupDays = scheduler.pickupDays;
                    console.log(this.events);
                    this.$ionicLoading.hide();
                }).catch(()=> {
                    console.error(arguments);
                    this.$ionicLoading.hide();
                    navigator.notification.alert('Unable to Find Your Schedule. ' +
                        'Make Sure You Are Connected to the Internet, and are in Houston');
                });
                this.$scope.$apply();
            }, (err) => {
                console.error(arguments);
                this.$ionicLoading.hide();
                navigator.notification.alert('Unable to Locate You. ' +
                    'You May Need To Change Your Privacy Settings');
            });
        });
    }
}