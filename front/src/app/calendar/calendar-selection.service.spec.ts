import { TestBed } from '@angular/core/testing';

import { CalendarSelectionService } from './calendar-selection.service';

describe('CalendarSelectionService', () => {
  let service: CalendarSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(CalendarSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
