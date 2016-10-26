import {Component} from "@angular/core";
import {NavParams} from "ionic-angular";
import {UrlUtil} from "../../common/UrlUtil";

@Component({
  templateUrl: 'DetailPage.html'
})
export class DetailPage {
  category:String;
  constructor(navParams:NavParams) {
    this.category = navParams.get('category');
  }
  openUrl = UrlUtil.openUrl;
}
