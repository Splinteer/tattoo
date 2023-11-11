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
import { ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-home',

  template: `
    @if (credentials$ | async; as credentials) {

    <app-calendar-view
      [shopUrl]="credentials.shop_url"
      showToggle
    ></app-calendar-view>

    }
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
  imports: [
    CommonModule,
    CalendarViewComponent,
    RouterModule,
    ReactiveFormsModule,
  ],
})
export class HomeComponent {
  public readonly credentials$ = inject(CredentialsService)
    .credentials$ as Observable<CredentialsWithShop>;
}
