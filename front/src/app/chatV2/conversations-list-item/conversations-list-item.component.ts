import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '../chat.interface';
import { ChatSelectionService } from '../chat-selection.service';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { TimeAgoPipe } from '@app/shared/timeAgo.pipe';
import { CustomerNamePipe } from '@app/shared/customer-name.pipe';

@Component({
  selector: 'app-conversations-list-item',
  standalone: true,
  imports: [CommonModule, AvatarComponent, TimeAgoPipe, CustomerNamePipe],
  template: `
    <button
      class="container"
      [class.active]="activeChat()?.project?.id === conversation.project.id"
      [class.unread]="!conversation.lastEvent.isRead"
    >
      <app-avatar
        [customer]="
          conversation.type === 'customer'
            ? conversation.shop
            : conversation.customer
        "
      ></app-avatar>

      <div class="details">
        <div class="contact-name">
          {{
            conversation.type === 'customer'
              ? conversation.shop.name
              : (conversation.customer | customerName)
          }}
        </div>
        <div class="project-name">{{ conversation.project.name }}</div>
        <div class="last-message">
          @if (conversation.lastEvent.type === 'message') {
            {{ conversation.lastEvent.content }}
          } @else {
            @switch (conversation.lastEvent.type) {
              @default {
                Evenement
              }
            }
          }
        </div>
      </div>
      <div class="indicators">
        @if (!conversation.lastEvent.isRead) {
          <div class="unread-indicator"></div>
        }
        <div class="last-update">
          {{ conversation.lastEvent.creationDate | timeAgo: 'short' | async }}
        </div>
      </div>
    </button>
  `,
  styleUrls: ['./conversations-list-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationsListItemComponent {
  @Input({ required: true }) conversation!: Conversation;

  readonly #chatSelectionService = inject(ChatSelectionService);

  readonly activeChat = this.#chatSelectionService.conversation;

  @HostListener('click') click() {
    this.#chatSelectionService.setActiveConversation(this.conversation);
  }
}
