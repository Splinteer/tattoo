import { Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map, scan, switchMap, tap } from 'rxjs/operators';
import { ChatService } from './chat.service';

export interface Message {
  id: string;
  message: string;
  sender: boolean;
  date: Date;
}

export interface Chat {
  id: string;
  last_update: Date;
  contact: string;
  messages: Message[];
  read: boolean;
}

export interface ReactiveChat extends Chat {
  messagesSubject: BehaviorSubject<Message[]>;
  messages$: Observable<Message[]>;
}

@Component({
  selector: 'app-chat',
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
})
export class ChatComponent {
  private readonly chatService = inject(ChatService);

  public readonly chats$ = this.chatService.chats$;

  public readonly selectedChat$ = this.chatService.selectedChat$;

  public readonly selectChat = this.chatService.selectChat;

  public readonly markAsRead = this.chatService.markAsRead;

  addChat(chat: Chat): void {
    const newChat = {
      ...chat,

      read: false,
    };
    this.chatService.chats.next([newChat, ...this.chatService.chats.value]);
  }

  getChatMessages(chatId: string): Observable<Message[]> {
    return this.chats$.pipe(
      switchMap((chats) => {
        const chat = chats.find((chat) => chat.id === chatId);
        return chat ? chat.messages$ : new BehaviorSubject<Message[]>([]);
      })
    );
  }

  public newMessage = '';

  addMessage(chat: ReactiveChat): void {
    const message = this.newMessage.trim();

    if (!message.length) {
      return;
    }

    const newMessage: Message = {
      id: Date.now().toString(),
      message,
      sender: true,
      date: new Date(),
    };

    chat.messagesSubject.next([newMessage]);
    this.newMessage = '';
  }
}
