import { Component, OnInit } from '@angular/core';
import { MovieService } from 'src/app/service/movie/movie.service';
import { MoviePoster } from 'src/app/model/movie';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  selector: 'app-view-movies',
  templateUrl: './view-movies.component.html',
  styleUrls: ['./view-movies.component.scss']
})
export class ViewMoviesComponent implements OnInit {

  isMovieLoaded:boolean = false;
  
  moviePosters: MoviePoster[] = [];

  constructor(private _sanitizer: DomSanitizer, private movieService: MovieService) { }

  ngOnInit() {
    this.loadMoviePosters();
  }


  loadMoviePosters(){
    this.movieService.getAllMovieOnAir().subscribe(
      moviePosters => {
        this.moviePosters = moviePosters
        this.isMovieLoaded = true
      }
    )
  }
}
