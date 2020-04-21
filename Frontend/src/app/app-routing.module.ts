import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { ViewMoviesComponent } from './pages/view-movies/view-movies.component';
import { DetailMovieComponent } from './pages/detail-movie/detail-movie.component';
import { AdminViewMovieComponent } from './pages/admin/admin-view-movie/admin-view-movie.component';
import { AdminAddMovieComponent } from './pages/admin/admin-add-movie/admin-add-movie.component';
import { AdminPublishMovieComponent } from './pages/admin/admin-publish-movie/admin-publish-movie.component';
import { AdminUpdateMovieComponent } from './pages/admin/admin-update-movie/admin-update-movie.component';

const routes: Routes = [
  {
    path: 'movies',
    component: ViewMoviesComponent
  },
  {
    path: 'movies/:movieId',
    component: DetailMovieComponent
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: '/movies',
  },

  //Admin side
  {
    path: 'admin/movie/list',
    component: AdminViewMovieComponent
  },
  {
    path: 'admin/movie/add',
    component: AdminAddMovieComponent
  },
  {
    path: 'admin/movie/publish',
    component: AdminPublishMovieComponent
  },
  {
    path: 'admin/movie/update/:movieId',
    component: AdminUpdateMovieComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
