import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message } from '../chat.service';

@Component({
  selector: 'app-chat-message-list',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chat-message-list.component.html',
  styleUrls: ['./chat-message-list.component.scss'],
})
export class ChatMessageListComponent {
  @Input({ required: true }) messages!: Message[];

  onScroll() {
    console.log('fetch more');
  }
}
