import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatWindowComponent } from './chat-window/chat-window.component';
import { ChatDetailsPanelComponent } from '@app/chat-details-panel/chat-details-panel.component';
import { ChatService } from './chat.service';
import { ResponsiveComponent } from '@app/shared/responsive/responsive.component';
import { slideLeft } from '@app/shared/animation';

@Component({
  selector: 'app-chat',
  standalone: true,
  imports: [
    CommonModule,
    ChatListComponent,
    ChatWindowComponent,
    ChatDetailsPanelComponent,
  ],
  templateUrl: './chat.component.html',
  styleUrls: ['./chat.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  animations: [slideLeft()],
})
export class ChatComponent extends ResponsiveComponent {
  readonly #chatService = inject(ChatService);

  showDetailsPanel = this.#chatService.showDetailsPanel;
}
