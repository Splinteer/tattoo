import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@app/chatV2/chat.interface';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { ConversationActionsComponent } from '../conversation-actions/conversation-actions.component';
import { ConversationEventComponent } from '../conversation-event/conversation-event.component';

@Component({
  selector: 'app-conversation-events',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollComponent,
    TranslateModule,
    ConversationActionsComponent,
    ConversationEventComponent,
  ],
  template: `
    <app-infinite-scroll
      (loadMore)="loadEvents()"
      [fullyLoaded]="!!conversation.noMoreEvents"
      reverse
    >
      <app-conversation-actions
        [conversation]="conversation"
      ></app-conversation-actions>
      @if (conversation.events(); as events) {
        @for (
          event of events;
          track event.id;
          let index = $index;
          let isFirst = $first;
          let isLast = $last
        ) {
          <div>
            @if (
              isLast ||
              (event.creationDate | date: 'mediumDate') !==
                (events[index + 1].creationDate | date: 'mediumDate')
            ) {
              <div class="day">
                {{ event.creationDate | date: 'mediumDate' }}
              </div>
            }
            <app-conversation-event [event]="event"></app-conversation-event>
            @if (
              conversation.type === 'shop' &&
              event.isSender &&
              event.isRead &&
              (isFirst || !events[index - 1].isRead)
            ) {
              <div class="read-indicator" translate>CHAT.read</div>
            }
          </div>
        } @empty {
          'loading'
        }
      }
    </app-infinite-scroll>
  `,
  styles: `
      :host {
        margin: 0;
        overflow-y: auto;

        ::ng-deep {
          app-infinite-scroll .container {
            padding: var(--space-short) var(--space-middle);
            gap: var(--space-middle);
          }
        }
      }

      .day {
        text-align: center;
        font-size: var(--text-xs);
        color: var(--label-secondary);
        margin-bottom: var(--space-short);
      }

      .read-indicator {
        text-align: right;
        font-size: var(--text-xs);
        color: var(--label-tertiary);
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationEventsComponent {
  @Input({ required: true }) conversation!: Conversation;

  loadEvents() {
    // TODO
  }
}
