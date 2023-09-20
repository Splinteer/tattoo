import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

type ActionButton = {
  text: string;
  value: any;
  isDanger?: boolean;
};

export type ActionDialogData = {
  title: string;
  description?: string;
  vertical?: boolean;
  buttons: ActionButton[];
};

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="content">
      <div class="headline" translate>{{ data.title }}</div>
      <span class="footnote" *ngIf="data.description" translate>{{
        data.description
      }}</span>
    </div>

    <div class="buttons" [class.vertical]="data.vertical">
      <button
        *ngFor="let button of data.buttons"
        (click)="dialogRef.close(button.value)"
        [class.emphasized]="button.isDanger"
        [class.danger]="button.isDanger"
        translate
      >
        {{ button.text }}
      </button>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
        border-radius: var(--base-border-radius);
        background-color: var(--material-regular);
        width: min(80vw, 300px);
        backdrop-filter: blur(10px);
        overflow: hidden;
      }

      .content {
        display: flex;
        flex-direction: column;
        gap: var(--space-short);
        padding: var(--space-middle);
        text-align: center;
      }

      .buttons {
        display: flex;
        justify-content: center;
        align-items: center;
        border-top: 1px solid var(--separator-non-opaque);
        gap: 1px;

        &.vertical {
          flex-direction: column;

          button {
            border-width: 0;
            border-bottom-width: 1px;
          }
        }

        button {
          text-align: center;
          flex-grow: 1;
          width: 100%;
          border-style: solid;
          border-color: var(--separator-non-opaque);
          outline: none;

          border-width: 0;
          border-right-width: 1px;

          padding: var(--space-middle);
          color: var(--blue);

          &:last-of-type {
            border-width: 0;
          }

          &.danger {
            color: var(--red);
          }

          &:hover,
          &:focus-visible {
            background-color: var(--material-thick);
          }
        }
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionDialogComponent {
  public readonly dialogRef = inject(DialogRef);
  public readonly data: ActionDialogData = inject(DIALOG_DATA);
}
