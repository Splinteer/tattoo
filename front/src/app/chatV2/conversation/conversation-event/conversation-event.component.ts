import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ConversationEventAttachmentsComponent } from './conversation-event-attachments/conversation-event-attachments.component';
import { ConversationEventAppointmentNewComponent } from './conversation-event-appointment-new/conversation-event-appointment-new.component';
import { ConversationEventMessageComponent } from './conversation-event-message/conversation-event-message.component';
import { ConversationEventProjectNewComponent } from './conversation-event-project-new/conversation-event-project-new.component';
import { ChatEvent } from '@app/chatV2/event.interface';

@Component({
  selector: 'app-conversation-event',
  standalone: true,
  imports: [
    CommonModule,
    ConversationEventAttachmentsComponent,
    ConversationEventMessageComponent,
    ConversationEventProjectNewComponent,
    ConversationEventAppointmentNewComponent,
  ],
  template: `
    <div class="message">
      @switch (event.type) {
        @case ('message') {
          <app-conversation-event-message [isMine]="event.isSender">
            {{ event.property.text }}
          </app-conversation-event-message>
        }

        @case ('media') {
          <app-conversation-event-attachments
            [attachments]="event.property.urls"
            [isMine]="event.isSender"
          ></app-conversation-event-attachments>
        }

        @case ('project_created') {
          <app-conversation-event-project-new
            [event]="event"
          ></app-conversation-event-project-new>
        }

        @case ('appointment_new') {
          <app-conversation-event-appointment-new
            [event]="event"
          ></app-conversation-event-appointment-new>
        }
      }
    </div>

    <span class="message-time">
      {{ event.creationDate | date: 'shortTime' }}
    </span>
  `,
  styles: `
    :host {
      display: flex;
      align-items: center;
      gap: var(--space-middle);
      font-size: var(--subheadline-size);
      line-height: var(--subheadline-line-height);

      &.mine {
        flex-direction: row-reverse;
      }

      &.theirs {
        justify-content: flex-start;
      }
    }

    .message {
      max-width: 70%;
    }

    .message-time {
      font-size: var(--text-xs);
      color: var(--label-tertiary);
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationEventComponent {
  @Input({ required: true }) event!: ChatEvent;

  @HostBinding('class') get senderClass() {
    return this.event.isSender ? 'mine' : 'theirs';
  }
}
