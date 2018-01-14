import {Component, EventEmitter, Input, Output} from '@angular/core';
import moment from "moment";
import {categoryInfo} from "../CategoryInfo";

@Component({
  selector: 'event',
  template: `
      <ion-card class="upcoming-event">
          <ion-card-header class="date-header">{{data.day | relativeDate}}</ion-card-header>
          <ion-card-content>
              <ion-grid>
                  <ion-row *ngIf="data.possibleHoliday" class="possible-holiday" align-items-center>
                      <ion-col col-3>
                          <i class="fa fa-exclamation-triangle" aria-hidden="true"></i>
                      </ion-col>
                      <ion-col>
                          {{'Hey_This_Might_Be_A_Holiday' | translate}} <br>
                          {{'Check_The' | translate}} <a (click)="onTapHoliday.emit()"
                                                         href="#">{{'Holiday_Schedule' | translate}}</a>
                          {{'To_Make_Sure' | translate}}
                      </ion-col>
                  </ion-row>
                  <ion-row class="waste-types" justify-content-center align-items-top >
                      <ion-col *ngFor="let category of data.categories" class="waste-type"
                               (click)="onTapCategory.emit(category)" tappable>
                          <ion-row>
                                          <i class="fa" [ngClass]="categoryInfo[category].icon"></i>
                                      <label>{{categoryInfo[category].localizationKey | translate}}</label>
                              <ion-row [ngSwitch]="category" class="when">
                                      <ng-container *ngSwitchCase="'waste'">
                                          {{'Every' | translate}} {{pickupDays.wasteDay | dayOfWeek}}
                                      </ng-container>
                                      <ng-container *ngSwitchCase="'recycling'">
                                          {{'Every_Other' | translate}}
                                          {{pickupDays.recyclingDay | dayOfWeek}}
                                      </ng-container>
                                      <ng-container *ngSwitchCase="'junk'">
                                          {{moment().date(pickupDays.junkWeekOfMonth).format("Do")}}
                                          {{pickupDays.junkDay | dayOfWeek}} ({{'Even_Months' | translate}})
                                      </ng-container>
                                      <ng-container *ngSwitchCase="'tree'">
                                          {{moment().date(pickupDays.junkWeekOfMonth).format("Do")}}
                                          {{pickupDays.junkDay | dayOfWeek}} ({{'Odd_Months' | translate}})
                                      </ng-container>
                              </ion-row>
                          </ion-row>
                      </ion-col>
                  </ion-row>

              </ion-grid>


          </ion-card-content>
      </ion-card>`
})
export class Event {
  moment: typeof moment;
  @Input() data: any;
  @Input() pickupDays: any;
  @Output() onTapCategory = new EventEmitter<string>();
  @Output() onTapHoliday = new EventEmitter<void>();


  constructor() {
    this.categoryInfo = categoryInfo;
    this.moment = moment;
  }
}