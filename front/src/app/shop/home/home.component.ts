import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { backInDown } from '@shared/animation';
import { RouterModule } from '@angular/router';
import {
  CredentialsService,
  CredentialsWithShop,
} from '@app/auth/credentials.service';
import { Observable } from 'rxjs';
import { CalendarViewComponent } from '@app/calendar/calendar-view/calendar-view.component';

@Component({
  selector: 'app-home',

  template: `
    <ng-container *ngIf="credentials$ | async as credentials">
      <app-calendar-view [shopUrl]="credentials.shop_url"></app-calendar-view>
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
  imports: [CommonModule, CalendarViewComponent, RouterModule],
})
export class HomeComponent {
  public readonly credentials$ = inject(CredentialsService)
    .credentials$ as Observable<CredentialsWithShop>;
}
