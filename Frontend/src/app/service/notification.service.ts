import { Injectable } from '@angular/core';
declare var UIkit: any;

@Injectable()
export class NotificationService {

  constructor() { 
  }
  
  public failedPopup(message:string){
    this.popup(message, 'danger')
}

  public successPopup(message:string){
      this.popup(message, 'success')
  }

  public popup(message: string, status: string){
    UIkit.notification({message: message, status: status, pos: 'top-right'})
  }
}