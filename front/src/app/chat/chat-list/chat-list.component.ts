import { Component, inject } from '@angular/core';
import { BehaviorSubject, Observable, tap, map, scan, of } from 'rxjs';
import { Chat, ReactiveChat, Message } from '../chat.component';
import { ChatService } from '../chat.service';

@Component({
  selector: 'app-chat-list',
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent {
  public readonly chatService = inject(ChatService);

  public readonly chats$ = this.chatService.chats$;

  public readonly selectChat = this.chatService.selectChat;
}
