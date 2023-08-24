import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarItemComponent } from './calendar-item.component';

describe('CalendarItemComponent', () => {
  let component: CalendarItemComponent;
  let fixture: ComponentFixture<CalendarItemComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [CalendarItemComponent]
    });
    fixture = TestBed.createComponent(CalendarItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
