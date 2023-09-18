import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatEvent, ChatService, ReactiveChat } from '@app/chat/chat.service';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ProjectService } from '@app/project/project.service';
import {
  distinctUntilChanged,
  skipWhile,
  switchMap,
  combineLatest,
  of,
  tap,
} from 'rxjs';
import { ChatEventMessageComponent } from '../chat-event-message/chat-event-message.component';
import { ChatEventAttachmentsComponent } from '../chat-event-attachments/chat-event-attachments.component';

@Component({
  selector: 'app-chat-event-project-new',
  standalone: true,
  imports: [
    CommonModule,
    ChatEventMessageComponent,
    ChatEventAttachmentsComponent,
  ],
  template: `
    <ng-container *ngIf="project$ | async as project">
      <app-chat-event-message [isMine]="event.is_sender">
        Zone: {{ project.zone }}<br />
        Taille: {{ project.width_cm }}x{{ project.height_cm }}<br />
        Description:<br />
        {{ project.additional_information }}"
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

  readonly project$ = this.#projectService.projectLoader;

  openModalPreview(src?: string) {
    if (src) {
      return this.#imagePreviewService.openModal(src);
    }
  }
}
