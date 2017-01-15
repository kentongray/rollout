import {Component} from "@angular/core";
import {Platform} from "ionic-angular";
import {StatusBar} from "ionic-native";
import {HomePage} from "../pages/home/HomePage";
import {TranslateService} from "ng2-translate";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class RolloutApp {
  rootPage = HomePage;

  constructor(platform:Platform, translate: TranslateService) {
    platform.ready().then(() => {
      const splashscreenPlugin = (<any>navigator).splashscreen;
      if (splashscreenPlugin) {
        splashscreenPlugin.hide();
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleLightContent();
    });

    translate.setDefaultLang('en');
    translate.use('es');
  }
}
