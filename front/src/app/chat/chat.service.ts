import { HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { HttpService } from '@app/@core/http/http.service';
import { AvatarCustomer } from '@app/shared/avatar/avatar.component';
import { DateTime } from 'luxon';
import { of, tap } from 'rxjs';

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
  project_id: string;
  project_name: string;
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
  project_id: string;
  project_name: string;
  creation_date: DateTime;
  last_update: DateTime;
  contact_name: string;
  last_message: string;
  is_read: boolean;
  avatar: AvatarCustomer;
  messages?: WritableSignal<Message[]>;

  is_fully_loaded?: true;
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpService); // Inject your HttpService

  public readonly loadedChatsSignal = signal<ReactiveChat[]>([]);

  public readonly activeChatSignal = signal<ReactiveChat | null>(null);

  private readonly onActiveChange = toObservable(this.activeChatSignal)
    .pipe(
      takeUntilDestroyed(),
      tap((activeChat) => {
        if (!activeChat || activeChat.messages) {
          return;
        }

        this.loadMoreMessages(activeChat);
      })
    )
    .subscribe();

  private lastLoadedChatDate = DateTime.local();

  readonly isLoadedSignal = signal(false);

  constructor() {
    this.loadMoreChats().subscribe();

    console.log(this.lastLoadedChatDate.toISO());
  }

  setActiveChat(chat: ReactiveChat) {
    this.activeChatSignal.set(chat);
  }

  private formatToReactiveChat(chat: Chat): ReactiveChat {
    return {
      ...chat,
      creation_date: DateTime.fromISO(chat.creation_date),
      last_update: DateTime.fromISO(chat.last_update),
      messages: chat.messages ? signal(chat.messages) : undefined,
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
            this.activeChatSignal.set(formatedNewChats[0]);
          }
        })
      );
  }

  public loadMoreMessages(
    chat: ReactiveChat,
    date: string = DateTime.local().toISO() as string
  ) {
    let queryParams = new HttpParams();
    queryParams = queryParams.append('date', date);

    this.http
      .get<Message[]>(`/chat/${chat.id}/messages`, {
        params: queryParams,
      })
      .subscribe((newMessages) => {
        console.log(newMessages);
        if (newMessages.length) {
          if (!chat.messages) {
            chat.messages = signal<Message[]>(newMessages);
            this.loadedChatsSignal.update((chats) => {
              const chatIndex = chats.findIndex(
                (currentChat) => currentChat.id === chat.id
              );
              chats[chatIndex] = chat;

              return chats;
            });
          } else {
            chat.messages.update((currentMessages) => [
              ...(currentMessages ?? []),
              ...newMessages,
            ]);
          }
        } else {
          chat.is_fully_loaded = true;
        }
      });
  }

  addMessage(chat: ReactiveChat, content: string) {
    this.http
      .post<Message>(`/chat/${chat.id}/message`, { content })
      .subscribe((message) => {
        if (!chat.messages) {
          chat.messages = signal<Message[]>([]);
        }

        chat.messages.update((currentMessages) => [
          ...(currentMessages ?? []),
          message,
        ]);
      });
  }
}
