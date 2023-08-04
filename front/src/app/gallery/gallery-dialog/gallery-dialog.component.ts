import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Gallery, GalleryService } from '../gallery.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { ConfirmService } from '@app/shared/ui/confirm.service';
import { of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-gallery-dialog',
  templateUrl: './gallery-dialog.component.html',
  styleUrls: ['./gallery-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GalleryDialogComponent {
  public readonly gallery: Gallery = inject(DIALOG_DATA);

  public readonly dialog = inject(DialogRef);

  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  private readonly galleryService = inject(GalleryService);

  private readonly confirmService = inject(ConfirmService);

  public delete() {
    this.confirmService
      .confirm({
        title: 'GALLERY.DELETE_DIALOG.title',
        confirm: 'GALLERY.DELETE_DIALOG.confirm',
        isDelete: true,
      })
      .pipe(
        switchMap((confirm) => {
          if (confirm) {
            return this.galleryService.delete(this.gallery.id);
          }

          return of();
        }),
        tap(() => {
          this.dialog.close();
        })
      )
      .subscribe();
  }
}
