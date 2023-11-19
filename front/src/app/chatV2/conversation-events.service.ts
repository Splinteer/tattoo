import { Injectable, inject } from '@angular/core';
import { Conversation } from './chat.interface';
import { ChatEvent } from './event.interface';
import { filter, switchMap, tap } from 'rxjs';
import { ChatSelectionService } from './chat-selection.service';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ChatHttpService } from './chat-http.service';
import { ConversationService } from './conversation.service';

@Injectable({
  providedIn: 'root',
})
export class ConversationEventsService {
  readonly #chatHttpService = inject(ChatHttpService);

  readonly #conversation = inject(ChatSelectionService).conversation;

  readonly #conversationService = inject(ConversationService);

  readonly eventLoader = toObservable(this.#conversation)
    .pipe(
      takeUntilDestroyed(),
      filter(
        (conversation): conversation is Conversation => conversation !== null,
      ),
      filter((conversation) => conversation.events().length === 0),
      switchMap((conversation) =>
        this.#chatHttpService
          .getEvents(conversation)
          .pipe(
            tap((events) =>
              this.#addEventsToConversation(conversation, events),
            ),
          ),
      ),
    )
    .subscribe();

  addEvent(conversation: Conversation, content: string, attachments: File[]) {
    return this.#chatHttpService
      .addEvent(conversation, content, attachments)
      .pipe(tap((event) => this.#addEventsToConversation(conversation, event)));
  }

  #addEventsToConversation(conversation: Conversation, events: ChatEvent[]) {
    conversation.events.update((currentEvents) => [
      ...events,
      ...(currentEvents ?? []),
    ]);

    // this.#conversationService.update((conversation) => {
    //   const latestEvent = conversation.events()[0];
    //   if (!latestEvent) {
    //     return conversation;
    //   }

    //   const lastEvent: ChatLastEvent = {
    //     senderId: '',
    //     type: latestEvent.type,
    //     creationDate: latestEvent.creationDate,
    //     isRead: true,
    //     content:
    //       latestEvent.type === ChatEventType.MESSAGE
    //         ? latestEvent.property.text
    //         : '',
    //   };

    //   return {
    //     ...conversation,
    //     lastEvent,
    //   };
    // });
  }
}
