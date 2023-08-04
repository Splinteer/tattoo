import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { Flash, FlashService } from '../flash.service';
import { CredentialsService } from '@app/auth/credentials.service';
import { ConfirmService } from '@app/shared/ui/confirm.service';
import { of, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-flash-dialog',
  templateUrl: './flash-dialog.component.html',
  styleUrls: ['./flash-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashDialogComponent {
  public readonly flash: Flash = inject(DIALOG_DATA);

  public readonly dialog = inject(DialogRef);

  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  private readonly flashService = inject(FlashService);

  private readonly confirmService = inject(ConfirmService);

  public delete() {
    this.confirmService
      .confirm({
        title: 'FLASH.DELETE_DIALOG.title',
        description: 'FLASH.DELETE_DIALOG.description',
        confirm: 'FLASH.DELETE_DIALOG.confirm',
        isDelete: true,
      })
      .pipe(
        switchMap((confirm) => {
          if (confirm) {
            return this.flashService.delete(this.flash.id);
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
