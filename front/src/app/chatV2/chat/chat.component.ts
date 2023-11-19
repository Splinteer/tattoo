import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatSelectionComponent } from '../chat-selection/chat-selection.component';
import { ConversationsListComponent } from '../conversations-list/conversations-list.component';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
import { ConversationComponent } from '../conversation/conversation.component';
import { DetailsPanelService } from '../details-panel.service';
import { ConversationDetailsPanelComponent } from '../conversation-details-panel/conversation-details-panel.component';
import { slideLeft } from '@app/shared/animation';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ChatSelectionComponent,
    ConversationsListComponent,
    ConversationComponent,
    ConversationDetailsPanelComponent,
  ],
  animations: [slideLeft()],
  template: `
    <nav>
      <app-chat-selection></app-chat-selection>
      <app-conversations-list></app-conversations-list>
    </nav>
    @if (!isMobile() || !isDetailsPanelVisible()) {
      <app-conversation></app-conversation>
    }

    @defer (when isDetailsPanelVisible()) {
      @if (isDetailsPanelVisible()) {
        <app-conversation-details-panel
          [@slideLeft]
        ></app-conversation-details-panel>
      }
    }
  `,
  styles: `
    :host {
      display: grid;
      grid-template-columns: minmax(20%, 350px) 1fr auto;
      width: 100%;
      height: 100%;
      border: 1px solid var(--separator-opaque);
    }

    nav {
      border-right: 1px solid var(--separator-opaque);
      background-color: var(--material-control-sidebar);
    }

    nav + * {
      border-left: 1px solid var(--separator-opaque);
    }

    @media (max-width: 768px) {
      :host {
        grid-template-columns: auto 1fr;
      }

      app-chat-details-panel {
        border-left: none;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatComponent extends ResponsiveComponent {
  readonly isDetailsPanelVisible = inject(DetailsPanelService).visible;
}
