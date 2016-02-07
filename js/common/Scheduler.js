/**
 *
 * Handles pickup schedules for Houston.
 * TODO: Abstract to more generic schedule based system (cron?) and abstract Houston data to adapter allow easy addition of more regions
 *
 * Example "API" calls for citymap
 trash
 http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/111/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=DAY%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false
 heavy/junk
 http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/112/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=SERVICE%5FDA%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false
 recycling
 http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/113/query?geometryType=esriGeometryPoint&f=json&outSR=102100&outFields=SERVICE%5FDAY%2CQUAD&geometry=%7B%22x%22%3A%2D10617688%2E9548%2C%22y%22%3A3467985%2E443099998%7D&spatialRel=esriSpatialRelIntersects&returnGeometry=false

 **/
export class Scheduler {
    constructor($http, $q, pos, numberOfDays = 60) {

        this.numberOfDays = numberOfDays;
        this.pickupDays = {};
        //an array of moment dates that may have disrupted schedules
        this.holidays = ['2015-11-11', '2015-11-12', '2015-11-27', '2015-11-28',
            '2015-12-24', '2015-12-25', '2015-12-26',
            '2015-1-1', '2015-1-2'].map((d)=>moment(d));

        if (pos.coords) {
            this.pos = {y: pos.coords.latitude, x: pos.coords.longitude, spatialReference: {"wkid": 4326}};
        }
        else if (pos.x && pos.y) {
            this.pos = {x: pos.x, y: pos.y, spatialReference: {"wkid": 4326}};
        }

        var queryParams = {
            params: {
                geometryType: 'esriGeometryPoint',
                f: "json", outSR: 102100, outFields: encodeURIComponent('DAY,QUAD,SERVICE_DA,SERVICE_DAY'),
                geometry: JSON.stringify(this.pos),
                spatialRel: 'esriSpatialRelIntersects', returnGeometry: false
            }
        };
        var wastePromise = $http.get('http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/111/query',
            queryParams);
        var junkPromise = $http.get('http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/112/query',
            queryParams);
        var recyclingPromise = $http.get('http://crossorigin.me/http://mycity.houstontx.gov/ArcGIS10/rest/services/wm/MyCityMapData_wm/MapServer/113/query',
            queryParams);

        this.whenLoaded = $q.all([wastePromise, junkPromise, recyclingPromise]).then((allResults)=> {
            var [wasteData, junkData, recyclingData] = allResults.map((_) => _.data);
            this.configure(wasteData, junkData, recyclingData);
        });
    }

    configure(wasteData, junkData, recyclingData) {
        //waste is one day a week
        var wasteDay = -1;
        if (this.isValidData(wasteData)) {
            wasteDay = Scheduler.getDayIndex(wasteData.features[0].attributes.DAY);
        }

        //heavy trash pickup is in the form of #rd WEEKDAY
        var junkWeekOfMonth = -1;
        var junkDay = -1;
        if (this.isValidData(junkData)) {
            var junkPattern = junkData.features[0].attributes.SERVICE_DA;
            junkWeekOfMonth = junkPattern.substr(0, 1);
            junkDay = Scheduler.getDayIndex(junkPattern.substr(junkPattern.indexOf(' ')));
        }

        //recycling pickup is alternating weeks
        var recyclingDay = -1;
        var recyclingScheduleA = false;
        if (this.isValidData(recyclingData)) {
            var recyclingSchedule = recyclingData.features[0].attributes.SERVICE_DAY;
            recyclingDay = Scheduler.getDayIndex(recyclingSchedule.split('-')[0]);
            //if true it is the "first week", if false it is the second week
            recyclingScheduleA = recyclingSchedule.includes('-A');
        }

        this.pickupDays = {wasteDay, junkWeekOfMonth, junkDay, recyclingDay, recyclingScheduleA};
        this.buildEvents(this.numberOfDays);
        return this.events;
    }

    isValidData(data) {
        return data && data.features && data.features.length && data.features[0].attributes;
    }

    isWasteDay(day) {
        return day.day() == this.pickupDays.wasteDay;
    }

    //used for both trash/and junk days
    isHeavyDay(day) {
        var dayInMonth = day.clone().startOf('month');
        var occurances = 0;
        while (occurances < this.pickupDays.junkWeekOfMonth) {
            if (dayInMonth.day() == this.pickupDays.junkDay) {
                occurances++;
            }
            dayInMonth.add(1, 'days');
        }
        //offset the last day added (ew)
        dayInMonth.add(-1, 'days');
        return dayInMonth.isSame(day, 'day');
    }

    isTreeDay(day) {
        return !this.isEvenMonth(day) && this.isHeavyDay(day);
    }

    isJunkDay(day) {
        return this.isEvenMonth(day) && this.isHeavyDay(day);
    }

    isEvenMonth(day) {
        return (day.month() + 1) % 2 == 0;
    }

    isRecyclingDay(day) {
        //recycling schedule A occurs every other week (starting at second week)
        var isEvenWeek = day.weeks() % 2 == 0;
        var isThisWeek = (this.pickupDays.recyclingScheduleA && isEvenWeek) || (!this.pickupDays.recyclingScheduleA && !isEvenWeek);
        return isThisWeek && day.day() == this.pickupDays.recyclingDay;
    }

    isPossibleHoliday(day) {
        return _.some(this.holidays, (d) => d.isSame(day, 'day'))
    }

    getCategoriesForDay(day) {
        var eventsForDay = {
            waste: this.isWasteDay(day),
            junk: this.isJunkDay(day),
            tree: this.isTreeDay(day),
            recycling: this.isRecyclingDay(day)
        };
        //group filter out empty days
        return _.pairs(eventsForDay).filter((category)=>category[1]).map((category)=>category[0]);
    }

    buildEvents(numberOfDays) {
        var day = moment().startOf('day');
        var groupEvents = (day)=> {
            return {
                day: day, categories: this.getCategoriesForDay(day), possibleHoliday: this.isPossibleHoliday(day)
            }
        };
        this.events = _.range(0, numberOfDays).map((i)=>day.clone().add(i, 'days')).map(groupEvents)
            .filter((event) =>event.categories.length);

    }

    static getDayIndex(dayStr) {
        return moment(dayStr, "dddd").day()
    }

    static service($http, $q) {
        return (pos, numberOfDays) => new Scheduler($http, $q, pos, numberOfDays)
    }
}