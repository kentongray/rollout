// Ionic Starter App

import {onReady} from 'bootstrap';
import {router} from 'router';
import {LocationsCtrl} from 'LocationsCtrl';
import {HomeCtrl} from 'HomeCtrl';
import {RemindMeCtrl} from 'RemindMeCtrl';
import {Scheduler} from 'Scheduler'

angular.module('starter', ['ionic', 'starter.controllers', 'starter.services'])
    .config(router)
    .run(onReady);

angular.module('starter.controllers', ['LocalStorageModule','starter.services'])
    .controller('LocationsCtrl', LocationsCtrl)
    .controller('HomeCtrl', HomeCtrl)
    .controller('RemindMeCtrl', RemindMeCtrl)

    .filter('date', () => HomeCtrl.dateFilter)
    .filter('dayOfWeek', () => HomeCtrl.dayOfWeek);

angular.module('starter.services', [])
    .service('SchedulerService', Scheduler.service);
