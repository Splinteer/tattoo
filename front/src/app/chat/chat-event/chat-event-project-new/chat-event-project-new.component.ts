import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEvent,  } from '@app/chat/chat.service';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { ProjectService } from '@app/project/project.service';
import { ChatEventMessageComponent } from '../chat-event-message/chat-event-message.component';
import { ChatEventAttachmentsComponent } from '../chat-event-attachments/chat-event-attachments.component';
import { TranslateModule } from '@ngx-translate/core';

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
    <ng-container *ngIf="projectSignal() as project">
      <app-chat-event-message [isMine]="event.is_sender">
        Nouveau projet:
        <ng-container *ngFor="let type of project.types; let isLast = last">
          {{ 'BOOKING.types.' + type | translate }}{{ !isLast ? ',' : '' }}
        </ng-container>

        <br />
        Zone: {{ project.zone }}<br />
        Taille: {{ project.widthCm }}x{{ project.heightCm }}<br />
        Description:<br />
        {{ project.additionalInformation }}"
      </app-chat-event-message>

      <app-chat-event-attachments
        *ngIf="project.illustrations"
        [attachments]="project.illustrations"
        [isMine]="event.is_sender"
      >
      </app-chat-event-attachments>

      <app-chat-event-attachments
        *ngIf="project.locations"
        [attachments]="project.locations"
        [isMine]="event.is_sender"
      >
      </app-chat-event-attachments>
    </ng-container>
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
