import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminPublishMovieComponent } from './admin-publish-movie.component';

describe('AdminPublishMovieComponent', () => {
  let component: AdminPublishMovieComponent;
  let fixture: ComponentFixture<AdminPublishMovieComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AdminPublishMovieComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AdminPublishMovieComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
