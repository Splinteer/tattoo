import { TestBed } from '@angular/core/testing';

import { ConversationEventsService } from './conversation-events.service';

describe('ConversationEventsService', () => {
  let service: ConversationEventsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ConversationEventsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
