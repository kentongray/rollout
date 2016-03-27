import {Pipe, PipeTransform} from "angular2/core";
import * as moment from "moment";

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
    return undefined;
  }
 /* transform(value: number, args: any[]) {
    if(value && !isNaN(value) && args[0] === 'celsius') {
      var temp = (value - 32) * 5/9;
      var places = args[1];
      return temp.toFixed(places) + ' C';
    }

    return;
  }*/
}

@Pipe({
  name: 'dayOfWeek'
})
export class DayOfWeekPipe implements PipeTransform {
  transform(value:any, args:any[]):any {
    return moment().day(value).format("dddd");
  }
}