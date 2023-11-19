import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventAttachmentsComponent } from './conversation-event-attachments.component';

describe('ConversationEventAttachmentsComponent', () => {
  let component: ConversationEventAttachmentsComponent;
  let fixture: ComponentFixture<ConversationEventAttachmentsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventAttachmentsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
