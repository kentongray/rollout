import {Component} from "@angular/core";
import {Platform, Config} from "ionic-angular";
import {StatusBar} from "ionic-native";
import {HomePage} from "../pages/home/HomePage";
import {TranslateService} from "ng2-translate";

@Component({
  template: `<ion-nav [root]="rootPage"></ion-nav>`
})
export class RolloutApp {
  rootPage = HomePage;

  constructor(platform:Platform, translate: TranslateService, config: Config) {
    const lang = navigator.language.indexOf('es') > -1 ? 'es' : 'en';
    translate.setDefaultLang('en');
    translate.use(lang);

    platform.ready().then(() => {
      const splashscreenPlugin = (<any>navigator).splashscreen;
      if (splashscreenPlugin) {
        splashscreenPlugin.hide();
      }
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      StatusBar.styleLightContent();
      translate.get('Back').subscribe(res => {
        config.set('backButtonText', res);
      })
    });
  }
}
