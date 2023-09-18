import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService, ReactiveChat } from '../chat.service';
import { InfiniteScrollComponent } from '@app/shared/infinite-scroll/infinite-scroll.component';
import { TranslateModule } from '@ngx-translate/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { ChatEventComponent } from '../chat-event/chat-event.component';

@Component({
  selector: 'app-chat-event-list',
  standalone: true,
  imports: [
    CommonModule,
    InfiniteScrollComponent,
    TranslateModule,
    ChatEventComponent,
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './chat-event-list.component.html',
  styles: [
    `
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
  ],
})
export class ChatEventListComponent {
  @Input({ required: true }) chat!: ReactiveChat;

  readonly #chatService = inject(ChatService);

  readonly #credentialsService = inject(CredentialsService);

  readonly credentials = this.#credentialsService.credentials;

  loadEvents() {
    this.#chatService.queueLoadMoreEvents(this.chat);
  }
}
