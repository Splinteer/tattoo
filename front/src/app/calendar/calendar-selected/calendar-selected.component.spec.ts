import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarSelectedComponent } from './calendar-selected.component';

describe('CalendarSelectedComponent', () => {
  let component: CalendarSelectedComponent;
  let fixture: ComponentFixture<CalendarSelectedComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarSelectedComponent]
    });
    fixture = TestBed.createComponent(CalendarSelectedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
