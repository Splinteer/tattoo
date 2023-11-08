import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../chat.service';
import { ChatListItemComponent } from '../chat-list-item/chat-list-item.component';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';
import { ChatSelectorComponent } from '../chat-selector/chat-selector.component';

@Component({
  selector: 'app-chat-list',
  standalone: true,
  imports: [
    CommonModule,
    ChatListItemComponent,
    InfiniteScrollComponent,
    ChatSelectorComponent,
  ],
  template: `
    <app-chat-selector></app-chat-selector>
    <app-infinite-scroll
      (loadMore)="onScroll()"
      [fullyLoaded]="isFullyLoaded()"
    >
      @for (chat of chats(); track chat.project.id) {
      <app-chat-list-item [chat]="chat"></app-chat-list-item>
      } @empty { 'hello' }
    </app-infinite-scroll>
  `,
  styles: [
    `
      :host {
        display: flex;
        overflow-y: hidden;
        background-color: var(--material-control-sidebar);
        padding: var(--space-short);
        gap: var(--space-short);
        flex-direction: column;
      }
    `,
  ],
})
export class ChatListComponent {
  readonly #chatservice = inject(ChatService);

  readonly chats = this.#chatservice.orderedLoadedChats;

  readonly isFullyLoaded = this.#chatservice.isLoadedSignal;

  constructor() {
    this.#chatservice.createEventSource();
  }

  onScroll() {
    this.#chatservice.loadMoreChats().subscribe();
  }
}
