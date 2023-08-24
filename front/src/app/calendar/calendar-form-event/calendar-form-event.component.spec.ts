import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarFormEventComponent } from './calendar-form-event.component';

describe('CalendarCreateEventComponent', () => {
  let component: CalendarFormEventComponent;
  let fixture: ComponentFixture<CalendarFormEventComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarFormEventComponent],
    });
    fixture = TestBed.createComponent(CalendarFormEventComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
