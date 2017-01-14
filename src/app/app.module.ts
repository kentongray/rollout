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
import {TranslateModule, TranslateLoader} from "ng2-translate";
import {createTranslateLoader} from "../common/CreateTranslateLoader";

@NgModule({
  declarations: [
    RolloutApp,
    Focuser,
    HomePage,
    DetailPage,
    RemindMePage,
    RelativeDatePipe,
    DayOfWeekPipe,
  ],
  imports: [
    IonicModule.forRoot(RolloutApp),
    HttpModule,
    TranslateModule.forRoot({
      provide: TranslateLoader,
      useFactory: (createTranslateLoader),
      deps: [Http]
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
