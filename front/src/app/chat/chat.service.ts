import { HttpParams } from '@angular/common/http';
import {
  Injectable,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import {
  takeUntilDestroyed,
  toObservable,
  toSignal,
} from '@angular/core/rxjs-interop';
import { Router, ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/@core/http/http.service';
import { Credentials } from '@app/auth/credentials.service';
import { Project } from '@app/project/project.service';
import { AvatarCustomer } from '@app/shared/avatar/avatar.component';
import { ResponsiveService } from '@app/shared/responsive/responsive.service';
import { environment } from '@env/environment';
import { DateTime } from 'luxon';
import {
  Observable,
  Subject,
  concatMap,
  filter,
  map,
  of,
  skipWhile,
  tap,
} from 'rxjs';

export type Attachment = string;

export type Message = {
  id: string;
  chat_id: string;
  creation_date: string;
  is_sender: boolean;
  content: string;
  is_read: boolean;
  attachments: Attachment[];
};

export type Chat = {
  id: string;
  project_name: string;
  shop_id: string;
  project_id: string;
  creation_date: string;
  last_update: string;
  contact_name: string;
  last_message: string;
  is_read: boolean;
  avatar: AvatarCustomer;
  messages?: Message[];
};

export type ReactiveChat = {
  id: string;
  shop_id: string;
  project_id: string;
  project_name: string;
  creation_date: DateTime;
  last_update: DateTime;
  contact_name: string;
  last_message: string;
  is_read: boolean;
  avatar: AvatarCustomer;
  messages: WritableSignal<Message[]>;
  project: WritableSignal<Project | null>;
  is_fully_loaded?: true;
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpService);

  private readonly responsiveService = inject(ResponsiveService);

  readonly #router = inject(Router);

  readonly #route = inject(ActivatedRoute);

  readonly test = this.#route.params.subscribe(console.log);

  private readonly showDetailsPanelByDefault = computed(
    () => !this.responsiveService.isMobile()
  );

  public readonly synced = signal(false);

  public readonly loadedChatsSignal = signal<ReactiveChat[]>([]);

  public readonly orderedLoadedChats = computed(() => {
    const loadedChats = this.loadedChatsSignal();
    loadedChats.sort((a, b) => (a.last_update < b.last_update ? 1 : -1));

    return loadedChats;
  });

  public readonly activeChatSignal = signal<ReactiveChat | null>(null);

  readonly showDetailsPanel = signal(this.showDetailsPanelByDefault());

  private readonly onActiveChange = toObservable(this.activeChatSignal)
    .pipe(
      takeUntilDestroyed(),
      tap(() => this.showDetailsPanel.set(this.showDetailsPanelByDefault())),
      filter((activeChat): activeChat is ReactiveChat => !!activeChat),
      tap((activeChat) => {
        if (!activeChat.is_fully_loaded) {
          this.queueLoadMoreMessages(activeChat);
        }

        this.#router.navigate([
          '/chat',
          activeChat.id,
          this.chatToUrl(activeChat),
        ]);
      })
    )
    .subscribe();

  chatToUrl(chat: ReactiveChat) {
    return `${chat.contact_name.replaceAll(
      ' ',
      '-'
    )}-${chat.project_name.replaceAll(' ', '-')}`;
  }

  private lastLoadedChatDate = DateTime.local();

  readonly isLoadedSignal = signal(false);

  toggleDetailsPanel() {
    this.showDetailsPanel.set(!this.showDetailsPanel());
  }

  setActiveChat(chat: ReactiveChat, setRead = true) {
    this.activeChatSignal.set(chat);

    if (setRead && !chat.is_read) {
      this.setChatAsRead(chat).subscribe();
    }
  }

  public setChatAsRead(chat: ReactiveChat) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append(
      'date',
      chat.last_update.toISO() as string
    );

    return this.http
      .post<void>(
        `/chat/read`,
        { chatId: chat.id },
        {
          params: queryParams,
        }
      )
      .pipe(
        tap(() => {
          chat.is_read = true;
          chat.messages.update((messages) =>
            messages.map((message) => ({ ...message, is_read: true }))
          );
        })
      );
  }

  private formatToReactiveChat(chat: Chat): ReactiveChat {
    return {
      ...chat,
      creation_date: DateTime.fromISO(chat.creation_date),
      last_update: DateTime.fromISO(chat.last_update),
      messages: signal(chat.messages ?? []),
      project: signal<Project | null>(null),
    };
  }

  public loadMoreChats() {
    if (this.isLoadedSignal()) {
      return of([]);
    }

    let queryParams = new HttpParams();
    queryParams = queryParams.append(
      'date',
      this.lastLoadedChatDate.toISO() as string
    );

    return this.http
      .get<Chat[]>(`/chat/shop`, {
        params: queryParams,
      })
      .pipe(
        tap((newChats) => {
          if (!newChats.length) {
            this.isLoadedSignal.set(true);
            return;
          }

          const formatedNewChats = newChats.map(this.formatToReactiveChat);
          this.loadedChatsSignal.update((currentChats) => [
            ...currentChats,
            ...formatedNewChats,
          ]);

          this.lastLoadedChatDate = DateTime.fromISO(
            (newChats.at(-1) as Chat).last_update
          );

          if (!this.activeChatSignal()) {
            const { id } = this.getUrlParams();
            if (id) {
              const urlChat = this.loadedChatsSignal().find(
                (chat) => chat.id === id
              );
              if (urlChat) {
                this.setActiveChat(urlChat, false);
              } else {
                this.loadChat(id).subscribe((chat) => {
                  this.setActiveChat(chat, false);
                });
              }
            } else {
              this.setActiveChat(formatedNewChats[0], false);
            }
          }
        })
      );
  }

  private getUrlParams() {
    let route = this.#router.routerState.root;
    while (route.firstChild) {
      route = route.firstChild;
    }

    return route.snapshot.params;
  }

  private loadChat(chatId: string) {
    return this.http.get<Chat>(`/chat/shop/${chatId}`).pipe(
      map((chat) => {
        const formatedNewChat = this.formatToReactiveChat(chat);
        let chats: ReactiveChat[] = [];
        this.loadedChatsSignal.update((currentChats) => {
          chats = [...currentChats, formatedNewChat];

          return chats;
        });

        console.log(chats, formatedNewChat);

        const lastChat = chats.at(-1);
        if (lastChat) {
          this.lastLoadedChatDate = lastChat.last_update;
        }

        return formatedNewChat;
      })
    );
  }

  readonly #loadRequests = new Subject<ReactiveChat>();

  readonly #listenLoads = this.#loadRequests
    .pipe(
      skipWhile((chat) => !!chat.is_fully_loaded),
      concatMap((chat: ReactiveChat) => this.loadMessagesForChat(chat))
    )
    .subscribe();

  public queueLoadMoreMessages(chat: ReactiveChat) {
    this.#loadRequests.next(chat);
  }

  private loadMessagesForChat(chat: ReactiveChat) {
    const messages = chat.messages();

    const date = (
      messages?.length
        ? DateTime.fromISO(messages.at(-1)?.creation_date as string).toISO()
        : DateTime.local().toISO()
    ) as string;

    let queryParams = new HttpParams();
    queryParams = queryParams.append('date', date);

    return this.http
      .get<Message[]>(`/chat/${chat.id}/messages`, {
        params: queryParams,
      })
      .pipe(
        tap((newMessages) => {
          this.addMessagesToChat(chat, newMessages);
          if (!newMessages.length) {
            chat.is_fully_loaded = true;
          }
        })
      );
  }

  private addMessagesToChat(
    chat: ReactiveChat,
    messages: Message[],
    isNew = false
  ) {
    if (!messages.length) {
      return;
    }

    this.loadedChatsSignal.update((chats) => {
      let registeredMessages: Message[] = [];
      chat.messages.update((currentMessages) => {
        registeredMessages = isNew
          ? [...messages, ...(currentMessages ?? [])]
          : [...(currentMessages ?? []), ...messages];

        return registeredMessages;
      });

      chat.last_update =
        DateTime.fromISO(registeredMessages[0].creation_date) ||
        chat.last_update;

      return chats;
    });
  }

  addMessage(chat: ReactiveChat, content: string, attachments: File[]) {
    const formData = new FormData();

    formData.append('content', content);
    attachments.forEach((file) => {
      formData.append('attachments', file);
    });

    this.http
      .post<Message>(`/chat/${chat.id}/message`, formData)
      .subscribe((message) => {
        chat.messages.update((currentMessages) => [
          ...(currentMessages ?? []),
          message,
        ]);
      });
  }

  createEventSource(tryCount = 1) {
    try {
      const source = new EventSource(`${environment.serverUrl}/chat/sync`, {
        withCredentials: true,
      });

      source.addEventListener('open', () => this.synced.set(true));

      source.addEventListener('message', ({ data }) => {
        const newMessage = JSON.parse(data) as Message;
        if (!newMessage) {
          return;
        }

        const loadedChats = this.loadedChatsSignal();

        const chat = loadedChats.find((c) => c.id === newMessage.chat_id);
        if (!chat) {
          this.loadChat(newMessage.chat_id).subscribe();
          return;
        }

        this.addMessagesToChat(chat, [newMessage], true);
      });

      source.addEventListener('error', (error) => {
        this.synced.set(false);
        if (source.readyState === EventSource.CLOSED) {
          setTimeout(() => {
            this.createEventSource();
          }, 5000); // 5 seconds delay
        } else {
          console.error('EventSource failed:', error);
        }
      });
    } catch (error) {
      if (tryCount <= 5) {
        setTimeout(() => {
          this.createEventSource(tryCount + 1);
        }, 5000); // 5 seconds delay
      }
    }
  }
}
