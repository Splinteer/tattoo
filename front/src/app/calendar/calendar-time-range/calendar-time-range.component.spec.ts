import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarTimeRangeComponent } from './calendar-time-range.component';

describe('CalendarTimeRangeComponent', () => {
  let component: CalendarTimeRangeComponent;
  let fixture: ComponentFixture<CalendarTimeRangeComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarTimeRangeComponent]
    });
    fixture = TestBed.createComponent(CalendarTimeRangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
