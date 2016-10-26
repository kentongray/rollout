export class UrlUtil {
  static openUrl(url:string, target:string  = "_system", options:any = undefined) {
    console.log('opening url', url, target, options);
    return window.cordova ? (<any>window.cordova).InAppBrowser.open(url, target, options) : window.open(url);
  }
}