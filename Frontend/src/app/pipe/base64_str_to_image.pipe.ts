import { Pipe, PipeTransform } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';

@Pipe({name: 'base64StrToImg'})
export class Base64StrToImgPipe implements PipeTransform {
  transform(moviePoster: string, sanitizer: DomSanitizer): SafeResourceUrl {
    if(moviePoster){
      if(moviePoster.startsWith(`b\'`)){
        moviePoster = moviePoster.slice(2, moviePoster.length - 1)
      }
    }
    return sanitizer.bypassSecurityTrustResourceUrl(moviePoster);
  }
}