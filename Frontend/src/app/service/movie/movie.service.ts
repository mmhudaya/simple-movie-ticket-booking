import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

import { environment } from '../../../environments/environment'
import { MovieDetail, MoviePoster, PurchaseMovieTicket, PublishMovieSchedule, IResponse, UpdateTicketPrice, MovieTicketTimeDetail, MovieDateSchedule } from 'src/app/model/movie';
import { Observable, forkJoin } from 'rxjs';


@Injectable()
export class MovieService {

  apiUrl: string = ''
  studioApiUrl:string = ''

  constructor(private http: HttpClient) { 
    //environment.apiUrl = http://192.168.1.11:5000/
    this.apiUrl = environment.apiUrl + 'movie'
    //apiUrl = http://192.168.1.11:5000/movie

    this.studioApiUrl = environment.apiUrl + 'studio'
  }

  //User Side
  getMovies() {
    //access http ke http://192.168.1.11:5000/movie dengan method="GET"
    return this.http.get<MoviePoster[]>(this.apiUrl);
  }

  getMovieDetail(id: number){
    return this.http.get<MovieDetail>(this.apiUrl + '/' + id);
  }

  getMovieSchedule(id:number){
    return this.http.get<MovieDetail>(this.apiUrl + '/schedule/' + id);
  }

  getMovieTicketTimeDetail(movieDateId:number){
    return this.http.get<MovieTicketTimeDetail[]>(this.apiUrl + '/ticket_detail/' + movieDateId)
  }

  purchaseMovieTicket(bookForm: PurchaseMovieTicket){
    return this.http.post<IResponse>(this.apiUrl + "/purchase_ticket", bookForm);
  }

  getAllMovieOnAir(){
    return this.http.get<MoviePoster[]>(this.apiUrl + '/on_air');
  }

  //Admin side
  addMovie(movie: MovieDetail){
    return this.http.post<IResponse>(this.apiUrl, movie)
  }

  deleteMovie(id: number){
    return this.http.delete<IResponse>(this.apiUrl + '/' + id)
  }

  publishMovieSchedule(publishMovieForm:PublishMovieSchedule){
    return this.http.post<IResponse>(this.apiUrl + '/schedule/publish', publishMovieForm);
  }

  updateMovie(movie:MovieDetail){
    return this.http.post<IResponse>(this.apiUrl + '/update', movie);
  }

  updateTicketPrice(updatedTicket:UpdateTicketPrice){
    return this.http.put<IResponse>(this.apiUrl + '/schedule/update_price', updatedTicket);
  }

  addStudio(studio:any) :any{
    return this.http.post(this.studioApiUrl, studio)
  }

  getStudio() :any{
    return this.http.get(this.studioApiUrl)
  }

  getScheduleTimeDetails(dateSchdules:MovieDateSchedule[]){
    let requests:Observable<MovieTicketTimeDetail[]>[] = []
    dateSchdules.forEach(dateSchdule => {
      requests.push(this.getMovieTicketTimeDetail(dateSchdule.id));
    });

    return forkJoin(requests)
  }
}