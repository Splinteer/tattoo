import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import {
  ActionDialogComponent,
  ActionDialogData,
} from './confirm-dialog.component';
import { map, tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly #dialog = inject(Dialog);

  open(
    options: ActionDialogData = {
      title: 'COMMON.CONFIRM.title',
      buttons: [
        {
          text: 'COMMON.cancel',
          value: false,
        },
        {
          text: 'COMMON.yes',
          isDanger: true,
          value: true,
        },
      ],
    }
  ) {
    const dialog = this.#dialog.open(ActionDialogComponent, {
      backdropClass: 'ios-backdrop',
      panelClass: 'ios-panel',
      data: options,
    });

    return dialog.closed.pipe(
      map((value) => (value === undefined ? false : value))
    );
  }
}
