import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Project, ProjectService } from '@app/project/project.service';
import { Dialog } from '@angular/cdk/dialog';
import { CalendarProposalComponent } from '@app/calendar/calendar-proposal/calendar-proposal.component';

@Component({
  selector: 'app-chat-shortcuts',
  standalone: true,
  imports: [CommonModule],
  template: `
    <ng-container *ngIf="projectSignal() as project">
      <ng-container *ngIf="!project.planned_date">
        <button (click)="proposal()">Proposer un rdv</button>
      </ng-container>

      <ng-container
        *ngIf="
          project.planned_date && project.is_paid && !project.customer_rating
        "
      >
        <button>Noter l'artiste</button>
      </ng-container>

      <ng-container
        *ngIf="project.planned_date && project.is_paid && !project.shop_rating"
      >
        <button>Noter le client</button>
      </ng-container>
    </ng-container>
  `,
  styles: [
    `
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
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatShortcutsComponent {
  readonly projectService = inject(ProjectService);

  readonly projectSignal = this.projectService.project;

  readonly #dialog = inject(Dialog);

  proposal() {
    this.#dialog.open<CalendarProposalComponent>(CalendarProposalComponent, {
      backdropClass: 'ios-backdrop',
      panelClass: 'ios-panel-plain',
    });
  }
}
