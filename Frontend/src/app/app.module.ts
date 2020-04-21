import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import {NgxPaginationModule} from 'ngx-pagination'

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ViewMoviesComponent } from './pages/view-movies/view-movies.component';
import { DetailMovieComponent } from './pages/detail-movie/detail-movie.component';
import { AdminViewMovieComponent } from './pages/admin/admin-view-movie/admin-view-movie.component';
import { AdminAddMovieComponent } from './pages/admin/admin-add-movie/admin-add-movie.component';
import { AdminPublishMovieComponent } from './pages/admin/admin-publish-movie/admin-publish-movie.component';
import { AdminUpdateMovieComponent } from './pages/admin/admin-update-movie/admin-update-movie.component';
import { MovieService } from './service/movie/movie.service';
import { InHourPipe } from './pipe/inhour.pipe';
import { GetMomentDateFormatPipe } from './pipe/get_moment_format.pipe';
import { TimePipe } from './pipe/time.pipe';
import { NotificationService } from './service/notification.service';
import { Base64StrToImgPipe } from './pipe/base64_str_to_image.pipe';
import { DateTimePickerModule } from '@syncfusion/ej2-angular-calendars';
 
@NgModule({
  declarations: [
    AppComponent,
    ViewMoviesComponent,
    DetailMovieComponent,
    AdminViewMovieComponent,
    AdminAddMovieComponent,
    AdminPublishMovieComponent,
    AdminUpdateMovieComponent,
    InHourPipe,
    GetMomentDateFormatPipe,
    TimePipe,
    Base64StrToImgPipe
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NgxPaginationModule,
    FormsModule,
    BrowserModule,
    DateTimePickerModule 
  ],
  providers: [MovieService, NotificationService],
  bootstrap: [AppComponent],
  exports: [InHourPipe, TimePipe, GetMomentDateFormatPipe, Base64StrToImgPipe]
})
export class AppModule { }
