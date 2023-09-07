import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ReactiveChat } from '../chat.service';
import { ChatListItemComponent } from '../chat-list-item/chat-list-item.component';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [CommonModule, ChatListItemComponent, InfiniteScrollComponent],
  templateUrl: './chat-list.component.html',
  styleUrls: ['./chat-list.component.scss'],
})
export class ChatListComponent {
  readonly #chatservice = inject(ChatService);

  readonly loadedChatsSignal = this.#chatservice.loadedChatsSignal;

  readonly isLoaded = this.#chatservice.isLoadedSignal;

  onScroll() {
    this.#chatservice.loadMoreChats().subscribe();
  }

  trackByIdx(index: number, item: ReactiveChat): string {
    return item.id;
  }
}
