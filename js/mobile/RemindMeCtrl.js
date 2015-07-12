export class RemindMeCtrl {
    constructor($scope, $ionicHistory, $ionicLoading, $ionicPlatform, $ionicPopover, localStorageService, SchedulerService) {
        angular.extend(this, {$scope, $ionicHistory, $ionicLoading, $ionicPlatform, $ionicPopover, localStorageService, SchedulerService});
        this.notificationsEnabled = localStorageService.get('notificationsEnabled') == 'true';
        this.timeOfDay = 'morning';
        this.wasteTypes = ['recycling', 'waste', 'junk'];
        this.recycling = true;
        this.waste = false;
        this.junk = false;
        this.hour = 6;
        this.$inject = ['$scope', 'this.$ionicLoading', $ionicPopover];

        $scope.$watchGroup(this.wasteTypes.map((i)=> 'remind.' + i), () => {
            var whats = this.activeWasteCategories();
            var description = this.makeDescriptionText(whats);
            this.whatDescription = description;
        });
        // .fromTemplate() method
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
           <ion-toggle ng-model="remind.junk" toggle-class="toggle-calm">Heavy/Tree Trash</ion-toggle>
        </ion-popover-view>`;

        this.timeOfDayPopOver = $ionicPopover.fromTemplate(timeOfDayTemplate, {
            scope: $scope
        });
        this.hourPopOver = $ionicPopover.fromTemplate(hourTemplate, {
            scope: $scope
        });
        this.whatPopOver = $ionicPopover.fromTemplate(whatTemplate, {
            scope: $scope
        });


    }

    setTimeOfDay(time) {
        this.timeOfDay = time;
        this.timeOfDayPopOver.hide();
    }

    setHour(hour) {
        this.hour = hour;
        this.hourPopOver.hide();
    }

    setupReminders() {
        cordova.plugins.notification.local.clearAll(function () {
            console.log('all notifications cleared');
        }, this);
        this.$ionicLoading.show({
            template: 'Creating Your Reminders'
        });

        this.$ionicPlatform.ready(() => {
            navigator.geolocation.getCurrentPosition((pos) => {
                var scheduler = this.SchedulerService(pos, 365);

                scheduler.whenLoaded.then(() => {
                    this.localStorageService.set('notificationsEnabled', true);
                    this.notificationsEnabled = true;
                    var notifications = _(scheduler.events).map((event) => {
                        var matches = _.intersection(event.categories, this.activeWasteCategories());
                        if (matches.length) {
                            return {
                                text: "Don't Forget to Rollout your " + this.makeDescriptionText(matches),
                                at: event.day.clone().set('hour', this.hour).startOf('hour').toDate()
                            };
                        }
                    }).compact().take(64).value();
                    console.log('creating notifications' , notifications);
                    cordova.plugins.notification.local.schedule(notifications);
                    this.pickupDays = scheduler.pickupDays;
                    console.log(this.events);
                    this.$ionicLoading.hide();
                    this.$ionicHistory.goBack();
                }).catch(()=> {
                    console.log(arguments);
                    this.$ionicLoading.hide();
                    navigator.notification.alert('Unable to Find Your Schedule. ' +
                        'Make Sure You Are Connected to the Internet');
                });
                this.$scope.$apply();
            },  (err) => {
                console.log(arguments);
                this.$ionicLoading.hide();
                navigator.notification.alert('Unable to Locate You. ' +
                    'You May Need To Change Your Privacy Settings');
            });
        });
    }

    makeDescriptionText(categories) {
        var description = "nothing";
        if (categories.length == 1)
            description = categories[0];
        else if (categories.length == 2)
            description = categories[0] + ' and ' + categories[1];
        else if (categories.length == 3)
            description = categories[0] + ', ' + categories[1] + ' and ' + categories[2];
        return description;
    }

    activeWasteCategories() {
        return _(this.wasteTypes).map((i)=> {
            return this[i] ? i : null
        }).compact().value();
    }
}
