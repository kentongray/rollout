import {NgModule} from "@angular/core";
import {IonicApp, IonicModule} from "ionic-angular";
import {RolloutApp} from "./app.component";
import {HomePage} from "../pages/home/HomePage";
import {RemindMePage} from "../pages/remindme/RemindMePage";
import {AddressLookup} from "../common/AddressLookup";
import {Scheduler} from "../common/Scheduler";
import {Focuser} from "../common/Focuser";
import {DayOfWeekPipe, RelativeDatePipe} from "../common/Pipes";
import {DetailPage} from "../pages/detail/DetailPage";
import {HttpModule, Http} from "@angular/http";
import {TranslateModule, TranslateLoader} from "@ngx-translate/core";
import { BrowserModule } from '@angular/platform-browser';
import { Event } from '../common/components/Event'
import {TranslateHttpLoader} from "@ngx-translate/http-loader";
import {HttpClient, HttpClientModule} from "@angular/common/http";
import {Observable} from "rxjs/Observable";
import spanish from "../i18n/es";
import english from "../i18n/en";
import {of} from "rxjs/observable/of";

// AoT requires an exported function for factories
export function HttpLoaderFactory() {
  return new SimpleTranslateLoader();
}

class SimpleTranslateLoader extends TranslateLoader {
  getTranslation(lang: string): Observable<any> {
    if(lang == 'es')
      return of(spanish);
    else return of(english)
  }

}


@NgModule({
  declarations: [
    RolloutApp,
    Focuser,
    HomePage,
    DetailPage,
    RemindMePage,
    RelativeDatePipe,
    DayOfWeekPipe,
    Event,
  ],
  imports: [
    BrowserModule,
    IonicModule.forRoot(RolloutApp),
    HttpModule,
    HttpClientModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient]
      }
    }),
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    RolloutApp,
    HomePage,
    RemindMePage,
    DetailPage,
  ],
  providers: [
    Scheduler,
    AddressLookup
  ]
})
export class AppModule {
}
