import { Injectable, inject, signal } from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';
import {
  Conversation,
  CustomerConversation,
  ShopConversation,
} from './chat.interface';
import { Observable, map } from 'rxjs';
import { HttpParams } from '@angular/common/http';
import { ChatEvent } from './event.interface';

@Injectable({
  providedIn: 'root',
})
export class ChatHttpService {
  readonly #http = inject(HttpService);

  getConversations(
    profile: string | 'personal',
    afterISO?: string,
  ): Observable<Conversation[]> {
    const params = new HttpParams();
    if (afterISO) {
      params.set('after', afterISO);
    }

    if (profile === 'personal') {
      return this.#http
        .get<CustomerConversation[]>('/v2/projects/personal', { params })
        .pipe(
          map((conversations) =>
            conversations.map((conversation) => ({
              ...conversation,
              events: signal<ChatEvent[]>([]),
            })),
          ),
        );
    }

    return this.#http
      .get<ShopConversation[]>(`/v2/projects/shops/${profile}`, {
        params,
      })
      .pipe(
        map((conversations) =>
          conversations.map((conversation) => ({
            ...conversation,
            events: signal<ChatEvent[]>([]),
          })),
        ),
      );
  }

  addEvent(
    conversation: Conversation,
    content: string,
    attachments: File[],
  ): Observable<ChatEvent[]> {
    const formData = new FormData();

    formData.append('content', content);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    return this.#http.post<ChatEvent[]>(
      `/v2/projects/${conversation.project.id}/events`,
      formData,
    );
  }

  getEvents(conversation: Conversation): Observable<ChatEvent[]> {
    const events = conversation.events();
    const oldestEvent = events.at(-1);

    const params = new HttpParams();
    if (oldestEvent) {
      params.set('after', oldestEvent.creationDate);
    }

    return this.#http.get<ChatEvent[]>(
      `/v2/projects/${conversation.project.id}/events`,
      {
        params,
      },
    );
  }
}
