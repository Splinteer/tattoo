import {
  ChangeDetectionStrategy,
  Component,
  OnInit,
  inject,
} from '@angular/core';
import { FlashService } from '../flash.service';
import { ActivatedRoute, Params } from '@angular/router';
import { switchMap } from 'rxjs';

@Component({
  selector: 'app-flash-edit',
  template: `
    <ng-container *ngIf="flash$ | async as flash">
      <app-shop-flash-add [flash]="flash"></app-shop-flash-add>
    </ng-container>
  `,
  styles: [
    `
      :host {
        width: 100%;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FlashEditComponent {
  private readonly flashService = inject(FlashService);

  private readonly route = inject(ActivatedRoute);

  public readonly flash$ = this.route.params.pipe(
    switchMap((params: Params) => this.flashService.get(params['id']))
  );
}
