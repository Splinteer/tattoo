import { Injectable, computed, inject } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpService } from '@app/@core/http/http.service';
import { CalendarEvent } from '@app/calendar/calendar.service';
import { ChatService, ReactiveChat } from '@app/chat/chat.service';
import { Flash } from '@app/flash/flash.service';
import { ConfirmDialogService } from '@app/shared/confirm-dialog/confirm-dialog.service';
import { distinctUntilChanged, switchMap, of, tap, filter } from 'rxjs';

export type ProjectType = 'flashs' | 'custom' | 'adjustment';

export type Project = {
  id: string;
  customer_id: string;
  shop_id: string;
  name: string;
  types: ProjectType[];
  is_first_tattoo: boolean;
  is_cover_up: boolean;
  is_post_operation_or_over_scar: boolean;
  zone: string;
  height_cm: number;
  width_cm: number;
  additional_information?: string;
  is_paid: boolean;
  planned_date: string;
  customer_availability?: string;
  customer_rating?: number;
  shop_rating?: number;
  flashs?: Flash[];
  attachments?: string[];
  illustrations?: string[];
  locations?: string[];
  appointments?: CalendarEvent[];
};

@Injectable({
  providedIn: 'root',
})
export class ProjectService {
  readonly #http = inject(HttpService);

  readonly #chatService = inject(ChatService);

  public readonly chat = this.#chatService.activeChatSignal;

  readonly project = computed(() => {
    const chat = this.chat();
    if (!chat) {
      return null;
    }

    const project = chat.project();
    if (!project) {
      this.get(chat!.project_id)
        .pipe(tap((project) => chat.project.set(project)))
        .subscribe();
      return null;
    }

    return chat.project();
  });

  reload() {
    const chat = this.chat();
    if (!chat || !chat.project) {
      return;
    }

    chat.project.set(null);
  }

  get(projectId: string) {
    return this.#http.get<Project>(`/project/${projectId}`);
  }

  todo(projectId: string) {
    // return this.#http
    //   .patch<void>(`/project/${projectId}`, { is_drawing_done: true })
    //   .pipe(
    //     tap(() => {
    //       const chat = this.chat();
    //       if (chat) {
    //         chat.project.update(
    //           (project) =>
    //             project && {
    //               ...project,
    //               is_drawing_done: true,
    //             }
    //         );
    //       }
    //     })
    //   )
    //   .subscribe();
  }
}
