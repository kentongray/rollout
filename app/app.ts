import {ionicBootstrap, Platform} from 'ionic-angular';
import {Type, Component} from '@angular/core';
import HomePage from "./pages/home/HomePage";
import {StatusBar} from 'ionic-native';
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
@Component({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
})
export class Rollout {
  rootPage: Type = HomePage;

  constructor(platform: Platform) {
    //insert init code here
  }
}
// Pass the main app component as the first argument
// Pass any providers for your app in the second argument
// Set any config for your app as the third argument:
// http://ionicframework.com/docs/v2/api/config/Config/

ionicBootstrap(Rollout);