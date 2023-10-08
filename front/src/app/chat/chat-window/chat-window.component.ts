import {
  ChangeDetectionStrategy,
  Component,
  HostListener,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChatService } from '../chat.service';
import { ChatInputComponent } from '../chat-input/chat-input.component';
import { ChatEventListComponent } from '../chat-event-list/chat-event-list.component';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { ChatHeaderComponent } from '@app/chat-header/chat-header.component';

@Component({
  selector: 'app-chat-window',
  standalone: true,
  imports: [
    CommonModule,
    ChatHeaderComponent,
    ChatEventListComponent,
    ChatInputComponent,
  ],
  // changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ng-container *ngIf="chat() as chat; else noChatActive">
      <app-chat-header [chat]="chat"></app-chat-header>
      <app-chat-event-list [chat]="chat"> </app-chat-event-list>
      <app-chat-input></app-chat-input>
    </ng-container>

    <ng-template #noChatActive> Aucun chat sélectionné </ng-template>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-direction: column;
        flex-grow: 1;
        overflow-y: hidden;
      }

      app-chat-event-list {
        flex-grow: 1;
      }

      app-chat-input {
        margin-top: auto;
        margin-bottom: var(--space-300);
      }
    `,
  ],
})
export class ChatWindowComponent {
  private readonly chatService = inject(ChatService);

  public readonly chat = this.chatService.activeChatSignal;

  @HostListener('click') onClick() {
    const chat = this.chat();
    if (!chat || chat.is_read) {
      return;
    }

    this.chatService.setChatAsRead(chat).subscribe();
  }
}
