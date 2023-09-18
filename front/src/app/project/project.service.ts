import { Injectable, inject } from '@angular/core';
import { toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { HttpService } from '@app/@core/http/http.service';
import { CalendarEvent } from '@app/calendar/calendar.service';
import { ChatService, ReactiveChat } from '@app/chat/chat.service';
import { Flash } from '@app/flash/flash.service';
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
  is_drawing_done: boolean;
  is_drawing_approved: boolean;
  is_paid: boolean;
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

  readonly projectLoader = toObservable(this.chat).pipe(
    distinctUntilChanged(),
    filter((c): c is ReactiveChat => !!c),
    switchMap((chat) => {
      if (chat.project()) {
        return of(chat.project() as Project);
      }

      return this.get(chat!.project_id).pipe(
        tap((project) => chat.project.set(project))
      );
    })
  );

  get(projectId: string) {
    return this.#http.get<Project>(`/project/${projectId}`);
  }
}
