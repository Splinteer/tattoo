import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSelectionService } from '../chat-selection.service';
import { ConversationHeadComponent } from './conversation-head/conversation-head.component';
import { ConversationEventsComponent } from './conversation-events/conversation-events.component';
import { ConversationFootComponent } from './conversation-foot/conversation-foot.component';

@Component({
  selector: 'app-conversation',
  standalone: true,
  imports: [
    CommonModule,
    ConversationHeadComponent,
    ConversationEventsComponent,
    ConversationFootComponent,
  ],
  template: `
    @if (conversation(); as conversation) {
      <app-conversation-head
        [conversation]="conversation"
      ></app-conversation-head>
      <app-conversation-events
        [conversation]="conversation"
      ></app-conversation-events>
      <app-conversation-foot
        [conversation]="conversation"
      ></app-conversation-foot>
    } @else {
      Aucun chat sélectionné
    }
  `,
  styles: `
      :host {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-y: hidden;
      }

      app-conversation-events {
        flex-grow: 1;
      }

      app-conversation-foot {
        margin-top: auto;
        margin-bottom: var(--space-300);
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationComponent {
  readonly conversation = inject(ChatSelectionService).conversation;

  @HostListener('click') onClick() {
    const conversation = this.conversation();
    if (!conversation || conversation.lastEvent.isRead) {
      return;
    }

    // this.chatService.setChatAsRead(chat).subscribe();
  }
}
