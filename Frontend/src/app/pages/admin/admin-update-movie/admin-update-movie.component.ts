import { Component, OnInit } from '@angular/core';
import { MovieDetail, MovieTicketTimeDetail, PublishScheduleDetail, PublishTimeDetail, PublishMovieSchedule } from 'src/app/model/movie';
import { DomSanitizer } from '@angular/platform-browser';
import { MovieService } from 'src/app/service/movie/movie.service';
import { NotificationService } from 'src/app/service/notification.service';
import { Router, ActivatedRoute } from '@angular/router';

import * as moment from 'moment';
import { L10n } from "@syncfusion/ej2-base";
declare var UIkit: any;

@Component({
  selector: 'app-admin-update-movie',
  templateUrl: './admin-update-movie.component.html',
  styleUrls: ['./admin-update-movie.component.scss']
})
export class AdminUpdateMovieComponent implements OnInit {

  movie:MovieDetail
  movieUpdateForm: MovieDetail 
  movieTimeDetails: MovieTicketTimeDetail[] = []
  movieId:string = ''

  isLoadMovie:boolean = false
  isLoadMovieSchedule:boolean = false

  isUpdateMovieInfo: boolean = false

  //Add Schedule
  studios:any[] = []
  public minDate: Date = new Date(new Date().getFullYear(), new Date().getMonth() , new Date().getDate(), 0);
  publishSchedule:PublishMovieSchedule
  submittingPublishForm:boolean = false

  formSchedule:any = {}

  //Update movie
  submittingUpdateMovieForm: boolean = false

  addScheduleModal:any
  changePriceModal:any

  //Change price
  submittingChangePriceForm:boolean = false
  changePriceParam:any = {}


  constructor(
    private route:ActivatedRoute,
    private _sanitizer: DomSanitizer, private movieService:MovieService, 
    private notification: NotificationService, 
    private router:Router ) { }

  ngOnInit() {
    this.movieId = this.route.snapshot.paramMap.get('movieId');
    this.addScheduleModal = UIkit.modal('#schedule-add')
    this.changePriceModal = UIkit.modal('#change-price')
    this.publishSchedule = {
      movie_id: parseInt(this.movieId),
      schedules: []
    }

    this.loadMovieDetail()
    this.loadStudio()
  }

  loadMovieDetail(){
    this.isLoadMovie = true
    this.movieService.getMovieDetail(parseInt(this.movieId)).subscribe(
      movie => {
        this.movie = movie
        this.movieUpdateForm = Object.assign({}, this.movie);
        this.loadMovieSchedule()
        this.isLoadMovie = false
      },
      err => {
        this.isLoadMovie = false

      }
    )
  }

  loadStudio(){
    this.movieService.getStudio().subscribe(
      studios => {
        this.studios = studios
      }
    )
  }

  loadMovieSchedule(){
    this.isLoadMovieSchedule = true
    this.movieTimeDetails = []
    if(this.movie.date_schedules && this.movie.date_schedules.length > 0){
      this.movieService.getScheduleTimeDetails(this.movie.date_schedules).subscribe(listOfmovieTimeDetails => {
        listOfmovieTimeDetails.forEach((movieTimeDetails, index) => {
          movieTimeDetails.forEach(moveTimeDetail => {
            moveTimeDetail.scehdule_date = this.movie.date_schedules[index].date
          });

          this.movieTimeDetails.push(...movieTimeDetails)
          this.isLoadMovieSchedule = false;
        });
      });
    }else{
      this.isLoadMovieSchedule = false
    }
  }

  onChangeImageFile(event){
    const file = event.target.files[0];
    const reader = new FileReader();
    let that = this
    if(file){
      reader.readAsDataURL(file);
      reader.onload = () => {
          that.movie.image = reader.result
          console.log(that.movie)
      };
    }else{
      this.movie.image = null
    }
  }


  onUpdateMovieForm(){
    this.isUpdateMovieInfo = true
  }


  cancelUpdateForm(){
    this.isUpdateMovieInfo = false;
  }


  addSchedule(){
    let dateMoment = moment(this.formSchedule.date).format('YYYY-MM-DD')
    let time =  moment(this.formSchedule.date).format('HH:mm')
    let studioId = parseInt(this.formSchedule.studio_id)

    let schedulePtr = this.publishSchedule.schedules.find(schedule => moment(schedule.date).isSame(dateMoment) && schedule.studio_id == studioId)
    
    let times: PublishTimeDetail[] = []
    times.push({
      time: time,
      price: this.formSchedule.price,
      total_ticket: this.formSchedule.total_ticket
    })

    if(schedulePtr){
      schedulePtr.times.push(...times)
    }else{
      this.publishSchedule.schedules.push({
        date: dateMoment.toString(),
        studio_id: studioId,
        times: times
      })
    }
    console.log(this.publishSchedule)
    this.formSchedule = {}
  }

  onPublishSchedule(){
    this.submittingPublishForm = true
    this.movieService.publishMovieSchedule(this.publishSchedule).subscribe(
      res => {
        this.submittingPublishForm = false
        if(res.error){          
          this.notification.failedPopup(res.message)
        }else{
          this.notification.successPopup(res.message)
          this.loadMovieDetail()
          this.addScheduleModal.hide()
        }
      },
      err => {
        this.submittingPublishForm = false
      }
    )
  }

  findStudio(studioId:any){
    return this.studios.find(studio => studio.id == studioId)
  }

  deleteTime(indexPublisSchedule:number, times: PublishTimeDetail[], index:number){
    times.splice(index, 1)
    if(times.length <= 0){
      this.publishSchedule.schedules.splice(indexPublisSchedule, 1);
    }
  }

  resetPublshForm(){
    this.formSchedule = {}
    this.publishSchedule = {
      movie_id: parseInt(this.movieId),
      schedules: []
    }
  }

  isFormPublishFormValid(){
    if(this.publishSchedule.schedules.length <= 0) return false
    return true
  }

  validAddSchedule(){
    if(this.formSchedule.date == null) return false
    if(this.formSchedule.studio_id == null || this.formSchedule.studio_id == '') return false
    if(this.formSchedule.total_ticket == null || this.formSchedule.total_ticket <= 0) return false
    if(this.formSchedule.price == null || this.formSchedule.price <= 0) return false
    return true
  }

  //Update Movie
  isFormUpdateMovieValid(){
    if(this.movieUpdateForm.name == '' || this.movieUpdateForm.name == null) return true
    if(this.movieUpdateForm.image == '' || this.movieUpdateForm.image == null) return true
    if(this.movieUpdateForm.duration <= 0 || this.movieUpdateForm.duration == null) return true
    if(this.movieUpdateForm.pg_rate == '' || this.movieUpdateForm.pg_rate == null) return true
    if(this.movieUpdateForm.cast == '' || this.movieUpdateForm.cast == null) return true
    if(this.movieUpdateForm.synopsis == '' || this.movieUpdateForm.synopsis == null) return true
    return false
  }

  onUpdateMovie(){
    this.submittingUpdateMovieForm = true
    this.movieUpdateForm.image = this.changeImageStrToBase64(this.movieUpdateForm.image);
    this.movieService.updateMovie(this.movieUpdateForm).subscribe(
      res => {
        if(res.error){
          this.notification.failedPopup(res.message)
        }else{
          this.notification.successPopup(res.message)
          this.loadMovieDetail()
          this.cancelUpdateForm()
        }
        this.submittingUpdateMovieForm = false
      }, err => {
        this.submittingUpdateMovieForm = false
        console.log(err)
        this.notification.failedPopup(err.statusText)
      }
    )
  }

  changeImageStrToBase64(moviePoster:string){
    if(moviePoster){
      if(moviePoster.startsWith(`b\'`)){
        moviePoster = moviePoster.slice(2, moviePoster.length - 1)
      }
    }
    return moviePoster
  }

  //Change Price
  onChangePrice(movieTime:MovieTicketTimeDetail){
    this.changePriceParam.movie_time_schedule_id = movieTime.id
    this.changePriceParam.price = movieTime.price
    this.changePriceParam.new_price = 0
  }

  isFormChangePriceFormValid(){
    if(this.changePriceParam.new_price <= 0 || this.changePriceParam.new_price == null) return false
    return true
  }
  
  resetChangePrice(){
    this.changePriceParam = {}
  }

  changePrice(){
    this.submittingChangePriceForm = true
    this.movieService.updateTicketPrice(this.changePriceParam).subscribe(
      res => {
        if(res.error){
          this.notification.failedPopup(res.message)
        }else{
          this.notification.successPopup(res.message)
          this.loadMovieDetail()
        }
        this.changePriceModal.hide()
        this.submittingChangePriceForm = false
      },
      err => {
        this.submittingChangePriceForm = false
        this.notification.failedPopup(err.statusText)
      }
    )
  }
}

