import { Injectable, inject, signal, computed } from '@angular/core';
import { ChatHttpService } from './chat-http.service';
import { Conversation } from './chat.interface';
import { environment } from '@env/environment';
import { Subject, combineLatest, exhaustMap, filter, map, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class ChatSelectionService {
  readonly #chatHttpService = inject(ChatHttpService);

  // States

  readonly chatsByProfile = signal<{
    [key: string | 'personal']: Conversation[];
  }>({});

  readonly noMoreConversation = signal(false);

  readonly selectedChatProfile = signal<(string | 'personal') | null>(null);

  readonly activeConversation = signal<string | null>(null);

  readonly conversations = computed<Conversation[]>(() => {
    const chatsByProfile = this.chatsByProfile();
    const selectedChatProfile = this.selectedChatProfile();

    if (!selectedChatProfile) {
      return [];
    }

    if (chatsByProfile[selectedChatProfile] === undefined) {
      this.loadConversations(selectedChatProfile, true).subscribe();

      return [];
    }

    return chatsByProfile[selectedChatProfile];
  });

  readonly conversation = computed<Conversation | null>(() => {
    const activeConversation = this.activeConversation();
    const conversations = this.conversations();
    if (!activeConversation || !conversations.length) {
      return null;
    }

    return (
      conversations.find(
        (conversation) => conversation.project.id === activeConversation,
      ) || null
    );
  });

  // Events

  readonly #loadMoreConversationsSubject = new Subject<void>();

  #conversationsLoader = combineLatest({
    profile: toObservable(this.selectedChatProfile),
    loadMore: this.#loadMoreConversationsSubject.asObservable(),
  })
    .pipe(
      takeUntilDestroyed(),
      map(({ profile }) => profile),
      filter((profile): profile is string => typeof profile === 'string'),
      exhaustMap((profile) => this.loadConversations(profile)),
    )
    .subscribe();

  loadMoreConversations() {
    this.#loadMoreConversationsSubject.next();
  }

  loadConversations(profile: 'personal' | string, isInit = false) {
    const lastEvent = !isInit ? this.conversations().at(-1)?.lastEvent : null;

    return this.#chatHttpService
      .getConversations(profile, lastEvent?.creationDate)
      .pipe(
        tap((conversations) => {
          const noMoreConversation =
            conversations.length < environment.conversationsQueryLimit;
          if (noMoreConversation) {
            this.noMoreConversation.set(true);
          }

          this.chatsByProfile.update((chatsByProfile) => ({
            ...chatsByProfile,
            [profile]: conversations,
          }));
        }),
      );
  }

  setActiveConversation(conversation: Conversation) {
    this.activeConversation.set(conversation.project.id);
  }
}
