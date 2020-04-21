import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'time'})
export class TimePipe implements PipeTransform {
  transform(timeString: string): string {
      let hour = timeString.split(":")[0];
      let minutes = timeString.split(":")[1];

      if(parseInt(hour) < 10){
          hour = "0" + hour
      }

      return `${hour}:${minutes}`
  }
}