import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { CalendarItemComponent } from '@app/calendar/calendar-item/calendar-item.component';
import { ChatService, ReactiveChat } from '@app/chat/chat.service';
import { FlashItemComponent } from '@app/flash/flash-item/flash-item.component';
import { ProjectService } from '@app/project/project.service';
import { ImagePreviewService } from '@app/shared/image-preview.service';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
import { TranslateModule } from '@ngx-translate/core';
import {
  combineLatest,
  skipWhile,
  switchMap,
  of,
  tap,
  distinctUntilChanged,
} from 'rxjs';

@Component({
  imports: [
    CommonModule,
    TranslateModule,
    FlashItemComponent,
    CalendarItemComponent,
  ],
  standalone: true,
  selector: 'app-chat-details-panel',
  templateUrl: './chat-details-panel.component.html',
  styleUrls: ['./chat-details-panel.component.scss'],
})
export class ChatDetailsPanelComponent extends ResponsiveComponent {
  readonly #chatService = inject(ChatService);

  readonly #projectService = inject(ProjectService);

  public readonly chat = this.#chatService.activeChatSignal;

  readonly #checkIfProjectLoaded = toObservable(this.chat)
    .pipe(
      takeUntilDestroyed(),
      distinctUntilChanged(),
      skipWhile((c): c is ReactiveChat => !c || !!c.project()),
      switchMap((chat) =>
        combineLatest({
          chat: of(chat),
          project: this.#projectService.get(chat!.project_id),
        })
      ),
      tap(({ chat, project }) => {
        if (chat) {
          chat.project.set(project);
        }
      })
    )
    .subscribe();

  readonly #imagePreviewService = inject(ImagePreviewService);

  temp = {
    flashs: {
      icon: 'fa-regular fa-sparkles',
      text: 'BOOKING.types.flashs',
    },
    custom: {
      icon: 'fa-regular fa-plus',
      text: 'BOOKING.types.custom',
    },
    adjustment: {
      icon: 'fa-regular fa-circle-dashed',
      text: 'BOOKING.types.adjustment',
    },
  };

  openModalPreview(src: string) {
    return this.#imagePreviewService.openModal(src);
  }

  close() {
    this.#chatService.toggleDetailsPanel();
  }
}
