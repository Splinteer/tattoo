import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../chat.service';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatMessageListComponent } from '../chat-message-list/chat-message-list.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [CommonModule, ChatInputComponent, ChatMessageListComponent],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent {
  private readonly chatService = inject(ChatService);

  public readonly chat = this.chatService.activeChatSignal;
}
