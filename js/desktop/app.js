import {AppCtrl} from 'AppCtrl';
import {Scheduler} from 'Scheduler';
import {GeoLocation} from 'GeoLocation';

angular.module('StarterApp', ['ngMaterial']).config(function ($mdThemingProvider) {
    $mdThemingProvider.definePalette('rollout', {
        "50": "#ebf8f0",
        "100": "#c4ebd2",
        "200": "#9dddb4",
        "300": "#7cd29a",
        "400": "#5cc681",
        "500": "#3bbb68",
        "600": "#34a45b",
        "700": "#2c8c4e",
        "800": "#257541",
        "900": "#1e5e34",
        "A100": "#c4ebd2",
        "A200": "#9dddb4",
        "A400": "#5cc681",
        "A700": "#2c8c4e"
    });
    $mdThemingProvider.theme('default')
        .primaryPalette('rollout');
}).controller("AppCtrl", AppCtrl)
    .service("SchedulerService", Scheduler.service)
    .service("GeoLocation", GeoLocation)
    .filter('date', () => AppCtrl.dateFilter)
    .filter('dayOfWeek', () => AppCtrl.dayOfWeek);
