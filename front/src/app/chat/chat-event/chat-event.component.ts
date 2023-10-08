import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEventProjectNewComponent } from './chat-event-project-new/chat-event-project-new.component';
import { ChatEventMessageComponent } from './chat-event-message/chat-event-message.component';
import { ChatEventAttachmentsComponent } from './chat-event-attachments/chat-event-attachments.component';
import { ChatEventAppointmentNewComponent } from './chat-event-appointment-new/chat-event-appointment-new.component';
import { ChatEvent } from './chat-event.type';

@Component({
  selector: 'app-chat-event',
  standalone: true,
  imports: [
    CommonModule,
    ChatEventMessageComponent,
    ChatEventAttachmentsComponent,
    ChatEventProjectNewComponent,
    ChatEventAppointmentNewComponent,
  ],
  templateUrl: './chat-event.component.html',
  styleUrls: ['./chat-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEventComponent {
  @Input({ required: true }) event!: ChatEvent;

  @HostBinding('class') get senderClass() {
    return this.event.isSender ? 'mine' : 'theirs';
  }
}
