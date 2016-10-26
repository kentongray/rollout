export class UrlUtil {
  static openUrl(url:string, target:string, options:any) {
    return cordova ? (<any>cordova).InAppBrowser.open(url, target, options) : window.open(url);
  }
}