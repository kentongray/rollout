export class AppCtrl {
    constructor($scope, $mdSidenav, SchedulerService, $q, GeoLocation) {
        this.$q = $q;
        this.loadingSchedule = false;
        this.schedulerService = SchedulerService;
        this.geoLocation = GeoLocation;
    }

    queryAddress(address) {
        if(address == "") {
            this.events = null; //clear out data
        }
        if (address.split([' ']).length == 1) {
            return this.$q.when([]);
        }

        return this.geoLocation.lookupAddress(address).then((r)=> {
            return r;
        });
    }

    getCategorySchedule(category) {
        var schedule = "unknown";
        if(category == 'junk') {
            schedule = moment().date(this.pickupDays.junkWeekOfMonth).format("Do") + " (Even Months)";
        }
        else if(category == 'tree') {
            schedule = moment().date(this.pickupDays.junkWeekOfMonth).format("Do") + " (Odd Months)";
        }
        else if(category == 'waste') {
           schedule = "Every " + AppCtrl.dayOfWeek(this.pickupDays.wasteDay);
        }
        else if(category == 'recycling') {
            schedule = "Every Other " + AppCtrl.dayOfWeek(this.pickupDays.recyclingDay);
        }
        return schedule;
    }

    getCategoryImage(category) {
        return "url(\"img/" + category + "-gray.png\")";
    }


    selectAddress(suggestion) {
        if(!suggestion) {
            this.events = null;
            return;
        }
        this.address = suggestion;
        console.log('address selected', suggestion);
        this.loadingSchedule = true;
        this.geoLocation.lookupCoordinates(suggestion).then((coords) => {
            console.log('got coordinates', coords);
            var scheduler = this.schedulerService(coords, 60);
            scheduler.whenLoaded.then(()=> {
                this.pickupDays = scheduler.pickupDays;
                this.loadingSchedule = false;
                this.events = scheduler.events
            });
        });

    }

    niceCategoryName(category) {
        if(category == 'waste') {
            return "Trash & Yard";
        }
        else {
            return category.charAt(0).toUpperCase() + category.slice(1);
        }
    }
    selectedItemChange(item) {
        console.log('seelcted', item);
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
}