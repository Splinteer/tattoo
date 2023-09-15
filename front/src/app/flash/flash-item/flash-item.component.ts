import {
  ChangeDetectionStrategy,
  Component,
  Input,
  booleanAttribute,
  inject,
} from '@angular/core';
import { Flash } from '../flash.service';
import { Dialog } from '@angular/cdk/dialog';
import { FlashDialogComponent } from '../flash-dialog/flash-dialog.component';
import { environment } from '@env/environment';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-flash-item',
  imports: [CommonModule, TranslateModule],
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './flash-item.component.html',
  styleUrls: ['./flash-item.component.scss'],
})
export class FlashItemComponent {
  @Input() flash!: Flash;

  @Input() clickable = true;

  @Input({ transform: booleanAttribute }) hideAvailability = false;

  public readonly publicBucket = environment.public_bucket;

  private readonly dialog = inject(Dialog);

  public openModal() {
    this.dialog.open(FlashDialogComponent, {
      maxWidth: '80%',
      data: this.flash,
    });
  }
}
