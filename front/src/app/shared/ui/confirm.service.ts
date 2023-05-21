import { Dialog } from '@angular/cdk/dialog';
import { Injectable } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';

@Injectable({
  providedIn: 'root',
})
export class ConfirmService {
  constructor(private dialog: Dialog) {}

  confirm(
    options?: typeof ConfirmDialogComponent.prototype.data
  ): Observable<boolean> {
    const dialogRef = this.dialog.open<ConfirmDialogComponent>(
      ConfirmDialogComponent,
      {
        data: options,
      }
    );

    return dialogRef.closed.pipe(map(Boolean), take(1));
  }
}
