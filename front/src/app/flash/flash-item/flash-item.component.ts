import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { Flash } from '../flash.service';
import { Dialog } from '@angular/cdk/dialog';
import { FlashDialogComponent } from '../flash-dialog/flash-dialog.component';
import { environment } from '@env/environment';
@Component({
  selector: 'app-flash-item',
  templateUrl: './flash-item.component.html',
  styleUrls: ['./flash-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashItemComponent {
  @Input() flash!: Flash;

  @Input() clickable = true;

  @Input() hideAvailability = false;

  public readonly publicBucket = environment.public_bucket;

  private readonly dialog = inject(Dialog);

  public openModal() {
    this.dialog.open(FlashDialogComponent, {
      maxWidth: '80%',
      data: this.flash,
    });
  }
}
