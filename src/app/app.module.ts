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
    IonicModule.forRoot(RolloutApp)
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
