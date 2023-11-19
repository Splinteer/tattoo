import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventsComponent } from './conversation-events.component';

describe('ConversationEventsComponent', () => {
  let component: ConversationEventsComponent;
  let fixture: ComponentFixture<ConversationEventsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
