import { Dialog } from '@angular/cdk/dialog';
import { Injectable, inject } from '@angular/core';
import {
  ActionDialogComponent,
  ActionDialogData,
} from './confirm-dialog.component';
import { map } from 'rxjs';
import { Optional } from '../global.types';

const defaultOptions = {
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
};
@Injectable({
  providedIn: 'root',
})
export class ConfirmDialogService {
  readonly #dialog = inject(Dialog);

  open(options: Optional<ActionDialogData, 'buttons'> = defaultOptions) {
    if (!options.buttons) {
      options.buttons = defaultOptions.buttons;
    }

    const dialog = this.#dialog.open(ActionDialogComponent, {
      backdropClass: 'ios-backdrop',
      panelClass: 'ios-panel',
      data: options,
    });

    return dialog.closed.pipe(
      map((value) => (value === undefined ? false : value)),
    );
  }
}
