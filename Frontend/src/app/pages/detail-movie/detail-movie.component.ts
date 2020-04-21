import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';
import { DomSanitizer } from '@angular/platform-browser';
import { MovieService } from 'src/app/service/movie/movie.service';
import { MovieDetail, MovieTicketTimeDetail, PurchaseMovieTicket, MovieDateSchedule } from 'src/app/model/movie';
import { NotificationService } from 'src/app/service/notification.service';

declare var UIkit: any;

@Component({
  selector: 'app-detail-movie',
  templateUrl: './detail-movie.component.html',
  styleUrls: ['./detail-movie.component.scss']
})
export class DetailMovieComponent implements OnInit {

  movieId:string;

  isMovieDetailLoaded:boolean = false
  isMovieTicketTimeLoaded:boolean = false
  isMovieTicketTimeRequested:boolean = false

  isTimeScheduleRequested:boolean = false
  isTimeScheduleLoaded:boolean = false

  selectedSchedule:MovieDateSchedule

  movieDetail:MovieDetail
  submittingPurchaseForm:boolean = false
  purchaseMovieTicket:PurchaseMovieTicket = {
    fullname: null,
    total_ticket: 0,
    total_price: 0,
    movie_time_schedule_id: 0
  }

  movieTimeSchedules:MovieTicketTimeDetail[] = []
  selectedMovieTicketTime:MovieTicketTimeDetail = null

  constructor(
    private route:ActivatedRoute,
    private router:Router,
    private _sanitizer: DomSanitizer,
    private movieService: MovieService,
    private notification: NotificationService) { 

  }

  ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.loadMovieDetail()
  }

  loadMovieDetail(){
    this.movieService.getMovieDetail(parseInt(this.movieId)).subscribe(
      movieDetail => {
        this.movieDetail = movieDetail
        console.log(this.movieDetail)
        this.isMovieDetailLoaded = true
      },
      err => {

      }
    )
  }
  
  onSelectDate(date:MovieDateSchedule){
    this.isTimeScheduleRequested = true
    this.isTimeScheduleLoaded = false
    this.resetPurchaseParam()

    this.selectedSchedule = date
    this.movieService.getMovieTicketTimeDetail(date.id).subscribe(
      movieTimeSchedules => {
        this.isTimeScheduleRequested = false
        this.isTimeScheduleLoaded = true
        this.movieTimeSchedules = movieTimeSchedules
      }
    )
  }

  onSelectTime(selectedMovieTicketTime: MovieTicketTimeDetail){
    this.resetPurchaseParam()
    this.selectedMovieTicketTime = selectedMovieTicketTime
  }

  onTicketBtnClicked(action:string){
    switch(action){
      case 'sub':
        if(this.purchaseMovieTicket.total_ticket > 0){
          this.purchaseMovieTicket.total_ticket--
        }
        break;
      case 'add':
        if(this.purchaseMovieTicket.total_ticket < 10){
          this.purchaseMovieTicket.total_ticket++
        }
        break;
    }

    this.updateTicketPrice()
  }

  updateTicketPrice(){
    this.purchaseMovieTicket.total_price = this.purchaseMovieTicket.total_ticket  * this.selectedMovieTicketTime.price
  }

  onPurchaseTicket(){
    this.submittingPurchaseForm = true
    this.purchaseMovieTicket.movie_time_schedule_id = this.selectedMovieTicketTime.id
    this.movieService.purchaseMovieTicket(this.purchaseMovieTicket).subscribe(
      response => {
        if(response.error){
          this.notification.failedPopup(response.message)
        }else{
          this.notification.successPopup(response.message);
          document.getElementById("back-btn").click();
          this.router.navigate(['/movies']);
        }
        this.submittingPurchaseForm= false

      },
      err => {
        this.notification.failedPopup(err.statusText)
        this.submittingPurchaseForm= false

      }
    )
  }


  resetPurchaseParam(){
    this.selectedMovieTicketTime = null

    let currName = this.purchaseMovieTicket.fullname
    this.purchaseMovieTicket = {
      fullname: currName,
      total_ticket: 0,
      total_price: 0,
      movie_time_schedule_id: 0
    }
  }
}
