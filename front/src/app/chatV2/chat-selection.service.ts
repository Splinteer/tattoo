import { Injectable, inject, signal, computed } from '@angular/core';
import { ChatHttpService } from './chat-http.service';
import { Conversation } from './chat.interface';
import { environment } from '@env/environment';
import { Subject, combineLatest, exhaustMap, filter, map, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerNamePipe } from '@app/shared/customer-name.pipe';

@Injectable({
  providedIn: 'root',
})
export class ChatSelectionService {
  readonly #chatHttpService = inject(ChatHttpService);

  readonly #router = inject(Router);

  readonly #route = inject(ActivatedRoute);

  readonly #customerNamePipe = inject(CustomerNamePipe);

  // States

  readonly chatsByProfile = signal<{
    [key: string | 'personal']: {
      conversations: Conversation[];
      noMoreConversation: boolean;
    };
  }>({});

  readonly selectedChatProfile = signal<(string | 'personal') | null>(null);

  readonly activeConversation = signal<string | null>(null);

  readonly conversations = computed<Conversation[]>(() => {
    const chatsByProfile = this.chatsByProfile();
    const selectedChatProfile = this.selectedChatProfile();

    if (!selectedChatProfile || !chatsByProfile[selectedChatProfile]) {
      return [];
    }

    return chatsByProfile[selectedChatProfile].conversations ?? [];
  });

  readonly noMoreConversation = computed<boolean>(() => {
    const chatsByProfile = this.chatsByProfile();
    const selectedChatProfile = this.selectedChatProfile();

    if (!selectedChatProfile) {
      return false;
    }

    return !!chatsByProfile[selectedChatProfile]?.noMoreConversation;
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

  #removeActiveConversationOnProfileChange = toObservable(
    this.selectedChatProfile,
  )
    .pipe(
      takeUntilDestroyed(),
      tap(() => this.setActiveConversation(null)),
    )
    .subscribe();

  #getUrlParams() {
    const url = window.location.pathname;

    const urlParts = url.replace('/chat/', '').split('/');

    if (urlParts.length === 3) {
      return { id: urlParts[0] };
    }

    return { id: urlParts[0] };
  }

  #defaultConversationSelection = combineLatest({
    selectedProfile: toObservable(this.selectedChatProfile),
    conversations: toObservable(this.conversations),
  })
    .pipe(
      takeUntilDestroyed(),
      tap(({ conversations }) => {
        const activeConversation = this.activeConversation();
        if (!activeConversation && conversations.length) {
          const { id } = this.#getUrlParams();
          if (id) {
            const urlChat = conversations.find(
              (conversation) => conversation.project.id === id,
            );
            if (urlChat) {
              this.setActiveConversation(urlChat);
            }
          } else {
            this.setActiveConversation(conversations[0]);
          }
        }
      }),
    )
    .subscribe();

  #conversationRouter = toObservable(this.conversation)
    .pipe(
      takeUntilDestroyed(),
      tap((conversation) => {
        if (conversation) {
          return this.#router.navigate([
            '/chat',
            ...this.#chatToUrl(conversation),
          ]);
        }

        return this.#router.navigate(['/chat']);
      }),
    )
    .subscribe();

  readonly #loadMoreConversationsSubject = new Subject<void>();

  #conversationsLoader = combineLatest({
    profile: toObservable(this.selectedChatProfile),
    loadMore: this.#loadMoreConversationsSubject.asObservable(),
  })
    .pipe(
      takeUntilDestroyed(),
      map(({ profile }) => profile),
      filter((profile): profile is string => typeof profile === 'string'),
      filter(() => !this.noMoreConversation()),
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

          this.chatsByProfile.update((chatsByProfile) => ({
            ...chatsByProfile,
            [profile]: { conversations, noMoreConversation },
          }));
        }),
      );
  }

  // Functions

  #chatToUrl(conversation: Conversation) {
    const url: string[] = [];
    if (conversation.type === 'shop') {
      const selectedProfile = this.selectedChatProfile();
      if (selectedProfile) {
        url.push(selectedProfile);
      }
      url.push(conversation.project.id);
      url.push(this.#customerNamePipe.transform(conversation.customer));
    } else {
      url.push(conversation.project.id);
      url.push(conversation.shop.url);
    }

    return url.map((part) => part.replaceAll(' ', '-'));
  }

  setActiveConversation(conversation: Conversation | null) {
    this.activeConversation.set(conversation?.project?.id ?? null);
  }
}
