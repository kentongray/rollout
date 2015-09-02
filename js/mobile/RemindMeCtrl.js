export class RemindMeCtrl {
    constructor($scope, $ionicHistory, $ionicLoading, $ionicPlatform, $ionicPopover,
                localStorageService, SchedulerService, alert, $stateParams) {
        angular.extend(this, {
            $scope,
            $ionicHistory,
            $ionicLoading,
            $ionicPlatform,
            $ionicPopover,
            localStorageService,
            SchedulerService,
            alert,
            $stateParams
        });
        this.notificationsEnabled = localStorageService.get('notificationsEnabled') == 'true';
        this.timeOfDay = 'morning';
        this.wasteTypes = ['recycling', 'waste', 'tree', 'junk'];
        this.recycling = true;
        this.waste = false;
        this.junk = false;
        this.hour = 6;
        console.log($stateParams, 'sp');
        this.pos = {x: $stateParams.longitude, y: $stateParams.latitude};
        this.$inject = ['$scope', 'this.$ionicLoading', $ionicPopover];

        $scope.$watchGroup(this.wasteTypes.map((i)=> 'remind.' + i), () => {
            var whats = this.activeWasteCategories();
            this.whatDescription = this.makeDescriptionText(whats);
        });

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

    safeApply(fn) {
        if (!this.$scope.$$phase) {
            this.$scope.$apply(fn);
        } else {
            fn();
        }
    }

    setupReminders() {
        cordova.plugins.notification.local.clearAll(this.safeApply(() => {
            //clear all notifications then start again
            this.$ionicPlatform.ready(() => {

                //todo: figure out where we are?
                var scheduler = this.SchedulerService(this.pos, 365);
                scheduler.whenLoaded.then(() => {
                    this.localStorageService.set('notificationsEnabled', true);
                    this.localStorageService.set('notificationsData', {
                        timeOfDay: this.timeOfDay,
                        categories: this.activeWasteCategories(),
                        hour: this.hour
                    });
                    this.notificationsEnabled = true;
                    var notifications = _(scheduler.events).map((event) => {
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
                    cordova.plugins.notification.local.schedule(notifications);

                    this.pickupDays = scheduler.pickupDays;
                    this.$ionicLoading.hide();
                    this.$ionicHistory.goBack();
                }).catch(()=> {
                    console.log(arguments);
                    this.$ionicLoading.hide();
                    this.alert('Unable to Find Your Schedule. ' +
                        'Make Sure You Are Connected to the Internet');
                });
            });
        }), this);
        this.$ionicLoading.show({
            template: 'Creating Your Reminders'
        });

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
