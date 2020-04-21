import { Pipe, PipeTransform } from '@angular/core';
import * as moment from 'moment';

@Pipe({name: 'momentDate'})
export class GetMomentDateFormatPipe implements PipeTransform {
  transform(date: string, format: string): string {
      let momentDate = moment(date)
      return momentDate.format(format)
  }
}