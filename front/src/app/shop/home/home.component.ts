import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { ShopService } from '../shop.service';
import { backInDown } from '@shared/animation';
import { CalendarComponent } from '@app/calendar/calendar/calendar.component';
import { DefaultAvailabilityComponent } from '@app/calendar/default-availability/default-availability.component';
import { SharedModule } from '@app/shared/shared.module';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [
    CommonModule,
    DefaultAvailabilityComponent,
    CalendarComponent,
    SharedModule,
    RouterModule,
  ],
})
export class HomeComponent {
  private readonly credentialsService = inject(CredentialsService);

  public readonly credentials$ = this.credentialsService.credentials$;

  private readonly shopService = inject(ShopService);
}
