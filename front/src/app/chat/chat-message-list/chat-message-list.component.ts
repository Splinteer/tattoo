import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, Message, ReactiveChat } from '../chat.service';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  imports: [CommonModule, InfiniteScrollComponent],
  templateUrl: './chat-message-list.component.html',
  styleUrls: ['./chat-message-list.component.scss'],
})
export class ChatMessageListComponent {
  @Input({ required: true }) chat!: ReactiveChat;

  readonly #chatService = inject(ChatService);

  loadMessages() {
    this.#chatService.queueLoadMoreMessages(this.chat);
  }
}
