import {Pipe, PipeTransform} from '@angular/core';
import * as moment from 'moment';

/**
 * Switches a moment compatible date object into a relative date (like Tomorrow)
 */
@Pipe({
  name: 'relativeDate'
})
export class RelativeDatePipe implements PipeTransform {

  transform(value:any, args:any[]):any {
    if (moment().isSame(value, 'day')) {
      return 'Today ' + value.format('MMM Do');
    } else if (moment().add(1, 'days').isSame(value, 'day')) {
      return 'Tomorrow ' + value.format('MMM Do');
    } else {
      return value.format('dddd MMM Do');
    }
  }
}

@Pipe({
  name: 'dayOfWeek'
})
export class DayOfWeekPipe implements PipeTransform {
  transform(value:any, args:any[]):any {
    return moment().day(value).format("dddd");
  }
}