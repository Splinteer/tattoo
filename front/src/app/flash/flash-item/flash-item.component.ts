import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { Flash } from '../flash.service';
import { Dialog } from '@angular/cdk/dialog';
import { FlashDialogComponent } from '../flash-dialog/flash-dialog.component';

@Component({
  selector: 'app-flash-item',
  templateUrl: './flash-item.component.html',
  styleUrls: ['./flash-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashItemComponent {
  @Input() flash!: Flash;

  @Input() clickable = true;

  private readonly dialog = inject(Dialog);

  public openModal() {
    this.dialog.open(FlashDialogComponent, {
      data: this.flash,
    });
  }
}
