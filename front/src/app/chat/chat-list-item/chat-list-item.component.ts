import { Component, HostListener, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ReactiveChat } from '../chat.service';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { TimeAgoPipe } from '@app/shared/timeAgo.pipe';

@Component({
  selector: 'app-chat-list-item',
  standalone: true,
  imports: [CommonModule, AvatarComponent, TimeAgoPipe],
  templateUrl: './chat-list-item.component.html',
  styleUrls: ['./chat-list-item.component.scss'],
})
export class ChatListItemComponent {
  @Input({ required: true }) chat!: ReactiveChat;

  readonly #chatService = inject(ChatService);

  readonly activeChat = this.#chatService.activeChatSignal;

  @HostListener('click') click() {
    this.#chatService.setActiveChat(this.chat);
  }
}
