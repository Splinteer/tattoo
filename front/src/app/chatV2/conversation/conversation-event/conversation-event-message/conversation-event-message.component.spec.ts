import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventMessageComponent } from './conversation-event-message.component';

describe('ConversationEventMessageComponent', () => {
  let component: ConversationEventMessageComponent;
  let fixture: ComponentFixture<ConversationEventMessageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventMessageComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventMessageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
