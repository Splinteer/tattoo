import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@app/chatV2/chat.interface';
import { DetailsPanelService } from '@app/chatV2/details-panel.service';
import { AvatarComponent } from '@app/shared/avatar/avatar.component';
import { CustomerNamePipe } from '@app/shared/customer-name.pipe';

@Component({
  selector: 'app-conversation-head',
  standalone: true,
  imports: [CommonModule, AvatarComponent, CustomerNamePipe],
  template: `
    <app-avatar
      [customer]="
        conversation.type === 'customer'
          ? conversation.shop
          : conversation.customer
      "
    ></app-avatar>
    <div class="name">
      {{
        conversation.type === 'customer'
          ? conversation.shop.name
          : (conversation.customer | customerName)
      }}
    </div>
    <div class="project-name">{{ conversation.project.name }}</div>

    <button class="button button-outline" (click)="toggleDetailsPanel()">
      <i class="fa-solid fa-address-card"></i>
      Projet
    </button>
  `,
  styles: `

      :host {
        display: flex;
        flex-wrap: wrap;
        gap: var(--space-middle);
        justify-content: space-between;
        align-items: center;
        padding: var(--space-short);
        background: var(--material-control-title-bar);
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

      app-avatar {
        width: 30px;
        height: 30px;
        border-radius: 50%;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationHeadComponent {
  @Input({ required: true }) conversation!: Conversation;

  readonly #detailsPanelService = inject(DetailsPanelService);

  readonly toggleDetailsPanel = () => this.#detailsPanelService.toggle();
}
