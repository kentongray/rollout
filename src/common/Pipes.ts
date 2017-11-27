import {Pipe, PipeTransform} from '@angular/core';
import moment from 'moment';
import {TranslateService} from '@ngx-translate/core';

/**
 * Switches a moment compatible date object into a relative date (like Tomorrow)
 */
@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {
  today;
  tomorrow;

  constructor(translate:TranslateService) {
    translate.get(['Today', 'Tomorrow']).subscribe(res => {
      this.today = res['Today'];
      this.tomorrow = res['Tomorrow'];
    })
  }

  transform(value:any, args?:any[]):any {
    if (moment().isSame(value, 'day')) {
      return `${this.today} ${value.format('MMMM, Do')}`;
    } else if (moment().add(1, 'days').isSame(value, 'day')) {
      return `${this.tomorrow} ${value.format('MMMM, Do')}`;
    } else {
      return value.format('dddd, MMMM Do');
    }
  }
}

@Pipe({
  name: 'dayOfWeek'
})
export class DayOfWeekPipe implements PipeTransform {
  transform(value:any, args?:any[]):any {
    return moment().day(value).format("dddd");
  }
}