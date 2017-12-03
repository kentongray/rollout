import {Component, Input, Output, EventEmitter} from '@angular/core';
import moment from "moment";
@Component({
  selector: 'event',
  template: `<ion-card class="upcoming-event">
            <ion-card-header class="date-header">{{data.day | relativeDate}}</ion-card-header>
            <div *ngIf="data.possibleHoliday" class="possible-holiday">
                <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                {{'Hey_This_Might_Be_A_Holiday' | translate}} <br>
                {{'Check_The' | translate}} <a (click)="onTapHoliday.emit()" href="#">{{'Holiday_Schedule' | translate}}</a> {{'To_Make_Sure' | translate}}
            </div>
            <ul class="waste-types">
                <li *ngFor="let category of data.categories" class="waste-type">
                    <div (click)="onTapCategory.emit(category)" tappable>
                        <div *ngIf="category == 'waste'">
                            <i class="fa fa-trash"></i>
                            <label>{{'Trash_And_Lawn' | translate}}</label>
                            <div class="when">{{'Every' | translate}} {{pickupDays.wasteDay | dayOfWeek}}</div>
                        </div>
                        <div *ngIf="category == 'recycling'">
                            <i class="fa fa-recycle"></i>
                            <label>{{'Recycling' | translate}}</label>
                            <div class="when">{{'Every_Other' | translate}} {{pickupDays.recyclingDay | dayOfWeek}}</div>
                        </div>
                        <div *ngIf="category == 'junk'">
                            <i class="fa fa-truck"></i>
                            <label>{{'Junk' | translate}}</label>
                            <div class="when">{{moment().date(pickupDays.junkWeekOfMonth).format("Do")}}
                                {{pickupDays.junkDay | dayOfWeek}} ({{'Even_Months' | translate}})
                            </div>
                        </div>

                        <div *ngIf="category == 'tree'">
                            <i class="fa fa-tree"></i>
                            <label>{{'Tree_Waste' | translate}}</label>
                            <div class="when">{{moment().date(pickupDays.junkWeekOfMonth).format("Do")}}
                                {{pickupDays.junkDay | dayOfWeek}} ({{'Odd_Months' | translate}})
                            </div>
                        </div>
                    </div>
                </li>
            </ul>
        </ion-card>`
})
export class Event {
  moment: typeof moment;
  @Input() data: any;
  @Input() pickupDays: any;
  @Output() onTapCategory = new EventEmitter<string>();
  @Output() onTapHoliday = new EventEmitter<void>();
  constructor() {
    this.moment = moment
  }
}