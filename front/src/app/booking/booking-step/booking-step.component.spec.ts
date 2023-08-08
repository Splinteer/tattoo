import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BookingStepComponent } from './booking-step.component';

describe('BookingStepComponent', () => {
  let component: BookingStepComponent;
  let fixture: ComponentFixture<BookingStepComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BookingStepComponent]
    });
    fixture = TestBed.createComponent(BookingStepComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
