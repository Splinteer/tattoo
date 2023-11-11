import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { TranslateModule } from '@ngx-translate/core';

type ActionButton = {
  text: string;
  value: unknown;
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
    <div class="ios-dialog">
      <div class="content">
        <div class="headline" translate>{{ data.title }}</div>
        @if (data.description) {
        <span class="footnote" translate>{{ data.description }}</span>
        }
      </div>

      <div class="buttons" [class.vertical]="data.vertical">
        @for (button of data.buttons; track button) {
        <button
          (click)="dialogRef.close(button.value)"
          [class.emphasized]="button.isDanger"
          [class.danger]="button.isDanger"
          translate
        >
          {{ button.text }}
        </button>
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionDialogComponent {
  public readonly dialogRef = inject(DialogRef);
  public readonly data: ActionDialogData = inject(DIALOG_DATA);
}
