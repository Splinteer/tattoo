import { DialogRef, DIALOG_DATA } from '@angular/cdk/dialog';
import { Component, inject } from '@angular/core';

interface ConfirmDialogData {
  title?: string;
  description?: string;
  cancel?: string;
  confirm?: string;
  isDelete?: true;
  confirmDanger?: true;
}

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <h2 translate>{{ data.title ?? 'COMMON.CONFIRM.title' }}</h2>
    @if (data.description) {
    <p class="text-muted" translate>
      {{ data.description }}
    </p>
    }
    <div class="button-group">
      <button
        class="button button-outline"
        [class.button-danger]="!!!data.confirmDanger && !!!data.isDelete"
        translate
        (click)="dialogRef.close(false)"
      >
        {{ data.cancel ?? 'COMMON.cancel' }}
      </button>
      <button
        class="button"
        [class.button-danger]="data.confirmDanger || data.isDelete"
        translate
        (click)="dialogRef.close(true)"
      >
        @if (data.isDelete) {
        <i class="fa-regular fa-trash button-icon-left"></i>
        }
        {{ data.confirm ?? 'COMMON.CONFIRM.confirm' }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        padding: var(--page-content-padding);
      }

      h2 {
        margin: 0;
        margin-bottom: var(--space-600);
      }

      p {
        margin-bottom: var(--space-600);
      }
    `,
  ],
})
export class ConfirmDialogComponent {
  public readonly dialogRef = inject(DialogRef<boolean>);

  public readonly data: ConfirmDialogData = inject(DIALOG_DATA);
}
