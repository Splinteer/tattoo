import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventAttachmentsComponent } from './chat-event-attachments.component';

describe('ChatEventAttachmentsComponent', () => {
  let component: ChatEventAttachmentsComponent;
  let fixture: ComponentFixture<ChatEventAttachmentsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatEventAttachmentsComponent]
    });
    fixture = TestBed.createComponent(ChatEventAttachmentsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
