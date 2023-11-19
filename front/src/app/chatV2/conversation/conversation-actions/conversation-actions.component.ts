import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Conversation } from '@app/chatV2/chat.interface';
import { Dialog } from '@angular/cdk/dialog';
import { CalendarProposalComponent } from '@app/calendar/calendar-proposal/calendar-proposal.component';
import { ProjectService } from '@app/project/project.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-conversation-actions',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    @if (!conversation.project.plannedDate) {
      <button (click)="proposal()" translate>
        CHAT.ACTIONS.appointment_proposal
      </button>
    }
    @if (
      conversation.project.plannedDate &&
      conversation.project.isPaid &&
      !conversation.project.customerRating
    ) {
      <button translate>CHAT.ACTIONS.appointment_review</button>
    }
    @if (
      conversation.project.plannedDate &&
      conversation.project.isPaid &&
      !conversation.project.shopRating
    ) {
      <button translate>CHAT.ACTIONS.appointment_customer_review</button>
    }
  `,
  styles: `
      :host {
        display: flex;
        justify-content: center;
        width: 100%;
        gap: var(--space-short);
        flex-wrap: wrap;
      }

      button {
        border: 1px solid var(--separator-non-opaque);
        background-color: transparent;
        padding: var(--space-xsmall) var(--space-short);
        border-radius: var(--base-border-radius);
        font-size: 0.8rem;
        color: var(--label-secondary);
        transition: background-color 0.2s ease-in;

        &:hover {
          background-color: var(--fill-quinary);
        }
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationActionsComponent {
  @Input({ required: true }) conversation!: Conversation;

  readonly projectService = inject(ProjectService);

  readonly projectSignal = this.projectService.project;

  readonly #dialog = inject(Dialog);

  proposal() {
    this.#dialog.open<CalendarProposalComponent>(CalendarProposalComponent, {
      backdropClass: 'ios-backdrop',
      panelClass: 'ios-panel-plain',
      data: {
        projectId: this.conversation.project.id,
      },
    });
  }
}
