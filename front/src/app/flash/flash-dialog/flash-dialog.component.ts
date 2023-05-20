import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Flash } from '../flash.service';

@Component({
  selector: 'app-flash-dialog',
  templateUrl: './flash-dialog.component.html',
  styleUrls: ['./flash-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashDialogComponent {
  public readonly flash: Flash = inject(DIALOG_DATA);

  public readonly dialog = inject(DialogRef);
}
