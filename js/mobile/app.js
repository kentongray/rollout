// Ionic Starter App

import {onReady} from 'bootstrap';
import {router} from 'router';
import {LocationsCtrl} from 'LocationsCtrl';
import {HomeCtrl} from 'HomeCtrl';
import {RemindMeCtrl} from 'RemindMeCtrl';
import {Scheduler} from 'Scheduler'
import {GeoLocation} from 'GeoLocation'

angular.module('starter', ['ionic', 'ionic.service.core',
    'ionic.service.deploy', 'starter.controllers', 'starter.services'])
    .config(['$ionicAppProvider', function($ionicAppProvider) {
        // Identify app
        $ionicAppProvider.identify({
            // The App ID (from apps.ionic.io) for the server
            app_id: '811ef447',
            // The public API key all services will use for this app
            api_key: 'da2dc0730f64b198e30cc64677fd15bbbea27266d824bf2d'
        });
    }])
    .config(router)

    .config(($ionicFilterBarConfigProvider) => {
        $ionicFilterBarConfigProvider.placeholder('Your Address');
    })
    .run(onReady);

angular.module('starter.controllers', ['LocalStorageModule', 'jett.ionic.filter.bar', 'starter.services'])
    .controller('LocationsCtrl', LocationsCtrl)
    .controller('HomeCtrl', HomeCtrl)
    .controller('RemindMeCtrl', RemindMeCtrl)
    .filter('date', () => HomeCtrl.dateFilter)
    .filter('dayOfWeek', () => HomeCtrl.dayOfWeek);

angular.module('starter.services', [])
    .service('GeoLocation', GeoLocation)
    .service('SchedulerService', Scheduler.service)
    .service('alert', () => (str)=>navigator.notification && navigator.notification.alert ? navigator.notification.alert(str) : window.alert(str));
