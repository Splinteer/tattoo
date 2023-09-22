import {
  ChangeDetectionStrategy,
  Component,
  HostBinding,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEvent, ChatService, ReactiveChat } from '../chat.service';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  distinctUntilChanged,
  skipWhile,
  switchMap,
  combineLatest,
  of,
  tap,
} from 'rxjs';
import { ProjectService } from '@app/project/project.service';
import { ChatEventProjectNewComponent } from './chat-event-project-new/chat-event-project-new.component';
import { ChatEventMessageComponent } from './chat-event-message/chat-event-message.component';
import { ChatEventAttachmentsComponent } from './chat-event-attachments/chat-event-attachments.component';
import { ChatEventAppointmentNewComponent } from './chat-event-appointment-new/chat-event-appointment-new.component';

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
    return this.event.is_sender ? 'mine' : 'theirs';
  }
}
