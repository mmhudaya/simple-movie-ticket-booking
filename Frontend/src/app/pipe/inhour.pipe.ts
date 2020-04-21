import { Pipe, PipeTransform } from '@angular/core';

@Pipe({name: 'inHour'})
export class InHourPipe implements PipeTransform {
  transform(totalMinutes: number): string {
    let hours = Math.floor(totalMinutes / 60);          
    let minutes = totalMinutes % 60;
    
    let hourString = ""
    if(hours > 0){
        hourString = hours + "h"
    }

    return `${hourString} ${minutes}m`
  }
}