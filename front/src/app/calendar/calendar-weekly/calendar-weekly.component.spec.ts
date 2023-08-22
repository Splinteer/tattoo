import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarWeeklyComponent } from './calendar-weekly.component';

describe('CalendarWeeklyComponent', () => {
  let component: CalendarWeeklyComponent;
  let fixture: ComponentFixture<CalendarWeeklyComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarWeeklyComponent]
    });
    fixture = TestBed.createComponent(CalendarWeeklyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
