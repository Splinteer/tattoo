import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { ProjectService } from '@app/project/project.service';
import { ChatEventMessageComponent } from '../chat-event-message/chat-event-message.component';
import { ChatEventAttachmentsComponent } from '../chat-event-attachments/chat-event-attachments.component';
import { TranslateModule } from '@ngx-translate/core';
import { ChatEvent } from '../chat-event.type';

@Component({
  selector: 'app-chat-event-project-new',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ChatEventMessageComponent,
    ChatEventAttachmentsComponent,
  ],
  template: `
    @if (projectSignal(); as project) {

    <app-chat-event-message [isMine]="event.isSender">
      Nouveau projet: @for (type of project.types; track type; let isLast =
      $last) {

      {{ 'BOOKING.types.' + type | translate }}{{ !isLast ? ',' : '' }}

      }

      <br />
      Zone: {{ project.zone }}<br />
      Taille: {{ project.widthCm }}x{{ project.heightCm }}<br />
      Description:<br />
      {{ project.additionalInformation }}
    </app-chat-event-message>

    @if (project.illustrations) {
    <app-chat-event-attachments
      [attachments]="project.illustrations"
      [isMine]="event.isSender"
    >
    </app-chat-event-attachments>
    } @if (project.locations) {
    <app-chat-event-attachments
      [attachments]="project.locations"
      [isMine]="event.isSender"
    >
    </app-chat-event-attachments>
    } }
  `,
  styles: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEventProjectNewComponent {
  readonly #projectService = inject(ProjectService);

  @Input({ required: true }) event!: ChatEvent;

  readonly #imagePreviewService = inject(ImagePreviewService);

  readonly projectSignal = this.#projectService.project;

  openModalPreview(src?: string) {
    if (src) {
      return this.#imagePreviewService.openModal(src);
    }
  }
}
