import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CalendarProposalComponent } from './calendar-proposal.component';

describe('CalendarProposalComponent', () => {
  let component: CalendarProposalComponent;
  let fixture: ComponentFixture<CalendarProposalComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [CalendarProposalComponent]
    });
    fixture = TestBed.createComponent(CalendarProposalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
