export class UrlUtil {
  static openUrl(url:string, target:string, options:any) {
    console.log('opening url', url, target = "_system", options = undefined);
    return window.cordova ? (<any>window.cordova).InAppBrowser.open(url, target, options) : window.open(url);
  }
}