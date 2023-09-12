import { Component, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../chat.service';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatMessageListComponent } from '../chat-message-list/chat-message-list.component';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    AvatarComponent,
    ChatMessageListComponent,
    ChatInputComponent,
  ],
  templateUrl: './chat-window.component.html',
  styleUrls: ['./chat-window.component.scss'],
})
export class ChatWindowComponent {
  private readonly chatService = inject(ChatService);

  public readonly chat = this.chatService.activeChatSignal;

  @HostListener('click') onClick() {
    const chat = this.chat();
    if (!chat || chat.is_read) {
      return;
    }

    this.chatService.setChatAsRead(chat).subscribe();
  }
}
