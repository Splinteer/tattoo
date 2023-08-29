import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSelectionComponent } from './calendar-selection.component';

describe('CalendarSelectionComponent', () => {
  let component: CalendarSelectionComponent;
  let fixture: ComponentFixture<CalendarSelectionComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarSelectionComponent]
    });
    fixture = TestBed.createComponent(CalendarSelectionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
