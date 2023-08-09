import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { Gallery } from '../gallery.service';
import { Dialog } from '@angular/cdk/dialog';
import { GalleryDialogComponent } from '../gallery-dialog/gallery-dialog.component';
import { environment } from '@env/environment';

@Component({
  selector: 'app-gallery-item',
  templateUrl: './gallery-item.component.html',
  styleUrls: ['./gallery-item.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryItemComponent {
  @Input() gallery!: Gallery;

  @Input() clickable = true;

  public readonly publicBucket = environment.public_bucket;

  private readonly dialog = inject(Dialog);

  public openModal() {
    this.dialog.open(GalleryDialogComponent, {
      maxWidth: '80%',
      data: this.gallery,
    });
  }
}
