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

// AoT requires an exported function for factories
export function HttpLoaderFactory(http: HttpClient) {
  return new TranslateHttpLoader(http, 'assets/i18n/', '.json');
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
