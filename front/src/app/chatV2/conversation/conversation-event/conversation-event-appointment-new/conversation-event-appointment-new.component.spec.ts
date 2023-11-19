import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ConversationEventAppointmentNewComponent } from './conversation-event-appointment-new.component';

describe('ConversationEventAppointmentNewComponent', () => {
  let component: ConversationEventAppointmentNewComponent;
  let fixture: ComponentFixture<ConversationEventAppointmentNewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ConversationEventAppointmentNewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ConversationEventAppointmentNewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
