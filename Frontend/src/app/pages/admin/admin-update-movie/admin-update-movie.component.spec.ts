import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminUpdateMovieComponent } from './admin-update-movie.component';

describe('AdminUpdateMovieComponent', () => {
  let component: AdminUpdateMovieComponent;
  let fixture: ComponentFixture<AdminUpdateMovieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminUpdateMovieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminUpdateMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
