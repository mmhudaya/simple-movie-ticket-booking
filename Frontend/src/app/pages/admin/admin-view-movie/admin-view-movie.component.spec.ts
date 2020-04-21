import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminViewMovieComponent } from './admin-view-movie.component';

describe('AdminViewMovieComponent', () => {
  let component: AdminViewMovieComponent;
  let fixture: ComponentFixture<AdminViewMovieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminViewMovieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminViewMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
