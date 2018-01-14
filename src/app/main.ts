import {platformBrowserDynamic} from '@angular/platform-browser-dynamic';

import {AppModule} from './app.module';

platformBrowserDynamic().bootstrapModule(AppModule);
document.addEventListener("deviceready", onDeviceReady, false);

function onDeviceReady() {
  window.codePush.sync(() => true, {updateDialog: true, installMode: InstallMode.IMMEDIATE});
}
