import {App, Platform} from 'ionic-angular';
import {Type} from '@angular/core';
import HomePage from "./pages/home/HomePage";
import {StatusBar} from 'ionic-native';
/// <reference path="../node_modules/typescript/lib/lib.es6.d.ts" />
@App({
  template: '<ion-nav [root]="rootPage"></ion-nav>',
  config: {} // http://ionicframework.com/docs/v2/api/config/Config/
})
export class Rollout {
  rootPage: Type = HomePage;

  constructor(platform: Platform) {
    platform.ready().then(() => {
      StatusBar.styleLightContent();
    });
  }
}
