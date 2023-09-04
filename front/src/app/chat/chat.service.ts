import { HttpParams } from '@angular/common/http';
import { Injectable, WritableSignal, inject, signal } from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';
import { AvatarCustomer } from '@app/shared/avatar/avatar.component';
import { DateTime } from 'luxon';
import { tap } from 'rxjs';

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
  creation_date: string;
  last_update: string;
  contact_name: string;
  avatar: AvatarCustomer;
  messages: Message[] | null;
};

export type ReactiveChat = {
  id: string;
  project_id: string;
  creation_date: DateTime;
  last_update: DateTime;
  contact_name: string;
  avatar: AvatarCustomer;
  messages: WritableSignal<Message[] | null>;

  is_fully_loaded?: true;
};

@Injectable({
  providedIn: 'root',
})
export class ChatService {
  private readonly http = inject(HttpService); // Inject your HttpService

  public readonly loadedChatsSignal = signal<ReactiveChat[]>([]);

  public readonly activeChatSignal = signal<ReactiveChat | null>(null);

  private lastLoadedChatDate = DateTime.local();

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
      messages: signal(chat.messages),
    };
  }

  public loadMoreChats() {
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
          if (newChats.length) {
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
          }
        })
      );
  }

  public loadMoreMessages(chat: ReactiveChat) {
    this.http
      .get<Message[]>(
        `/chats/${chat.project_id}/messages?date=${chat.last_update.toISO()}`
      )
      .subscribe((newMessages) => {
        if (newMessages.length) {
          chat.messages.update((currentMessages) => [
            ...(currentMessages ?? []),
            ...newMessages,
          ]);
        } else {
          chat.is_fully_loaded = true;
        }
      });
  }

  addMessage(chat: ReactiveChat, content: string) {
    console.log(chat);
    this.http
      .post<Message>(`/chat/${chat.id}/message`, { content })
      .subscribe((message) => {
        chat.messages.update((currentMessages) => [
          ...(currentMessages ?? []),
          message,
        ]);
      });
  }
}
