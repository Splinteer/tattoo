import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ReactiveChat } from '../chat.service';
import { ChatListItemComponent } from '../chat-list-item/chat-list-item.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, ChatListItemComponent],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent {
  public readonly loadedChatsSignal = inject(ChatService).loadedChatsSignal;

  private allDataLoaded = false;

  constructor() {}

  onScroll() {
    // if (!this.allDataLoaded) {
    //   this.fetchMore.next(true);
    // }
  }

  trackByIdx(index: number, item: ReactiveChat): string {
    return item.id;
  }
}
