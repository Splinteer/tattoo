import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEvent } from '@app/chatV2/event.interface';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { TranslateModule } from '@ngx-translate/core';
import { ConversationEventMessageComponent } from '../conversation-event-message/conversation-event-message.component';
import { ConversationEventAttachmentsComponent } from '../conversation-event-attachments/conversation-event-attachments.component';
import { ChatSelectionService } from '@app/chatV2/chat-selection.service';

@Component({
  selector: 'app-conversation-event-project-new',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ConversationEventMessageComponent,
    ConversationEventAttachmentsComponent,
  ],
  template: `
    @if (conversation()?.project; as project) {
      <app-conversation-event-message [isMine]="event.isSender">
        Nouveau projet:
        @for (type of project.types; track type; let isLast = $last) {
          {{ 'BOOKING.types.' + type | translate }}{{ !isLast ? ',' : '' }}
        }

        <br />
        Zone: {{ project.zone }}
        <br />
        Taille: {{ project.widthCm }}x{{ project.heightCm }}
        <br />
        Description:
        <br />
        {{ project.additionalInformation }}
      </app-conversation-event-message>

      @if (project.illustrations) {
        <app-conversation-event-attachments
          [attachments]="project.illustrations"
          [isMine]="event.isSender"
        ></app-conversation-event-attachments>
      }
      @if (project.locations) {
        <app-conversation-event-attachments
          [attachments]="project.locations"
          [isMine]="event.isSender"
        ></app-conversation-event-attachments>
      }
    }
  `,
  styles: ``,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationEventProjectNewComponent {
  @Input({ required: true }) event!: ChatEvent;

  readonly #imagePreviewService = inject(ImagePreviewService);

  readonly conversation = inject(ChatSelectionService).conversation;

  openModalPreview(src?: string) {
    if (src) {
      return this.#imagePreviewService.openModal(src);
    }
  }
}
