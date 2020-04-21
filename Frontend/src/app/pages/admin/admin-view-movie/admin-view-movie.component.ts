import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { MovieService } from 'src/app/service/movie/movie.service';
import { MoviePoster, MovieDetail } from 'src/app/model/movie';
import { NotificationService } from 'src/app/service/notification.service';
import { Router } from '@angular/router';
declare var UIkit: any;


@Component({
  selector: 'app-admin-view-movie',
  templateUrl: './admin-view-movie.component.html',
  styleUrls: ['./admin-view-movie.component.scss']
})
export class AdminViewMovieComponent implements OnInit {

  movies:MoviePoster[] = []
  tableLoaded:boolean = false
  currentPage:number = 1

  addMovie:MovieDetail = {
    name: null,
    image: null,
    duration: null,
    pg_rate: null,
    cast: null,
    synopsis: null
  }

  addStudio:any = {
    name: null
  }

  addMovieModal:any
  addStudioModal:any
  submittingAddForm: boolean = false

  constructor(private _sanitizer: DomSanitizer, private movieService:MovieService, 
    private notification: NotificationService, 
    private router:Router ) { }

  ngOnInit() {
    this.loadMovieTable()
  }

  ngAfterViewInit(){
    this.addMovieModal =  UIkit.modal('#movie-add');
    this.addStudioModal = UIkit.modal('#studio-add');
    this.addMovieModal.hide().then(function() {
      console.log("test")
    })
  }

  resetAddForm(){
    this.addMovie = {
      name: null,
      image: null,
      duration: null,
      pg_rate: null,
      cast: null,
      synopsis: null
    }

    this.addStudio = {
      name: null
    }
  }

  loadMovieTable(){
    this.tableLoaded = false
    this.movieService.getMovies().subscribe(
      movies => {
        this.tableLoaded = true
        this.movies = movies
      }
    )
  }

  deleteMovie(movie:MoviePoster){
    let that = this
    let movieId = movie.id
    UIkit.modal.confirm('Are you sure you want to delete <br> <b>' + movie.name + '</b> ? ', {
      labels: {
        cancel: "Cancel",
        ok: 'Delete'
      }
    }
    ).then(async function () {
      let response = await that.movieService.deleteMovie(movieId).toPromise()
      if(response.error){
        that.notification.failedPopup(response.message)
      }else{
        that.notification.successPopup(response.message);
        that.loadMovieTable()
      }
    }, function () {
        console.log('Rejected.')
    });
  }



  //Add Movie
  isFormAddMovieValid(){
    if(this.addMovie.name == '' || this.addMovie.name == null) return true
    if(this.addMovie.image == '' || this.addMovie.image == null) return true
    if(this.addMovie.duration <= 0 || this.addMovie.duration == null) return true
    if(this.addMovie.pg_rate == '' || this.addMovie.pg_rate == null) return true
    if(this.addMovie.cast == '' || this.addMovie.cast == null) return true
    if(this.addMovie.synopsis == '' || this.addMovie.synopsis == null) return true
    return false
  }

  onChangeImageFile(event){
    const file = event.target.files[0];
    const reader = new FileReader();
    let that = this
    if(file){
      reader.readAsDataURL(file);
      reader.onload = () => {
          that.addMovie.image = reader.result
          console.log(that.addMovie)
      };
    }else{
      this.addMovie.image = null
    }
  }

  onAddMovie(){
    this.submittingAddForm = true
    this.movieService.addMovie(this.addMovie).subscribe(
      res => {
        if(res.error){
          this.submittingAddForm = false
          this.notification.failedPopup(res.message)
        }else{
          this.submittingAddForm = false
          this.addMovieModal.hide()
          this.notification.successPopup(res.message)
          this.resetAddForm()
          this.loadMovieTable()
        }
          
      },
      err => {        
        this.submittingAddForm = false
      }
    )
  }


  //Add Studio
  isFormAddStudioValid(){
    if(this.addStudio.name == '' || this.addStudio.name == null) return true
    return false
  }
  
  onAddStudio(){
    this.submittingAddForm = true
    this.movieService.addStudio(this.addStudio).subscribe(
      res => {
        if(res.error){
          this.submittingAddForm = false
          this.notification.failedPopup(res.message)
        }else{
          this.submittingAddForm = false
          this.addStudioModal.hide()
          this.notification.successPopup(res.message)
        }
          
      },
      err => {        
        this.submittingAddForm = false
      }
    )
  }
}
