import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { ChatService, ReactiveChat } from '@app/chat/chat.service';

@Component({
  selector: 'app-chat-header',
  standalone: true,
  imports: [CommonModule, AvatarComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-avatar class="profile-pic" [customer]="chat.avatar"></app-avatar>
    <div class="name">{{ chat.contact_name }}</div>
    <div class="project-name">{{ chat.project_name }}</div>

    <button
      class="button button-outline"
      (click)="chatService.toggleDetailsPanel()"
    >
      <i class="fa-solid fa-address-card"></i>
      Projet
    </button>
  `,
  styles: [
    `
      :host {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-400);
        justify-content: space-between;
        align-items: center;
        border-bottom: 1px solid var(--gray-400);
        padding: var(--space-200);
      }

      button {
        margin-left: auto;

        i {
          margin-right: var(--space-100);
        }
      }

      .name {
        font-weight: bold;
        font-size: 1rem;
      }

      .project-name {
        color: var(--gray-800);
      }

      .profile-pic {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
    `,
  ],
})
export class ChatHeaderComponent {
  @Input({ required: true }) chat!: ReactiveChat;

  readonly chatService = inject(ChatService);
}
