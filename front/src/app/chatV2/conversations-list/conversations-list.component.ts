import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSelectionService } from '../chat-selection.service';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';
import { ConversationsListItemComponent } from '../conversations-list-item/conversations-list-item.component';

@Component({
  selector: 'app-conversations-list',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollComponent,
    ConversationsListItemComponent,
  ],
  template: `
    <app-infinite-scroll
      (loadMore)="onScroll()"
      [fullyLoaded]="noMoreConversation()"
    >
      @for (conversation of conversations(); track conversation.project.id) {
        <app-conversations-list-item
          [conversation]="conversation"
        ></app-conversations-list-item>
      } @empty {
        <p>No conversations</p>
      }
    </app-infinite-scroll>
  `,
  styles: `
      :host {
        display: flex;
        overflow-y: hidden;
        padding: var(--space-short);
        gap: var(--space-short);
        flex-direction: column;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsListComponent {
  readonly #chatSelectionService = inject(ChatSelectionService);

  readonly conversations = this.#chatSelectionService.conversations;

  readonly noMoreConversation = this.#chatSelectionService.noMoreConversation;

  onScroll() {
    this.#chatSelectionService.loadMoreConversations();
  }
}
