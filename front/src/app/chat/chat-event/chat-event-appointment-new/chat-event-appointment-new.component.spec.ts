import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ChatEventAppointmentNewComponent } from './chat-event-appointment-new.component';

describe('ChatEventAppointmentNewComponent', () => {
  let component: ChatEventAppointmentNewComponent;
  let fixture: ComponentFixture<ChatEventAppointmentNewComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ChatEventAppointmentNewComponent]
    });
    fixture = TestBed.createComponent(ChatEventAppointmentNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
