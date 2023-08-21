import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { backInDown } from '@shared/animation';
import { CalendarComponent } from '@app/calendar/calendar/calendar.component';
import { RouterModule } from '@angular/router';
import {
  CredentialsService,
  CredentialsWithShop,
} from '@app/auth/credentials.service';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-home',

  template: `
    <ng-container *ngIf="credentials$ | async as credentials">
      <app-calendar [shopId]="credentials.shop_id"></app-calendar>
    </ng-container>
  `,
  styles: [
    `
      :host {
        flex-grow: 1;
      }
    `,
  ],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CalendarComponent, RouterModule],
})
export class HomeComponent {
  public readonly credentials$ = inject(CredentialsService)
    .credentials$ as Observable<CredentialsWithShop>;
}
