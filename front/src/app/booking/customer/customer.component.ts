import { Component, inject } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-booking-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent {
  private readonly bookingService = inject(BookingService);

  public readonly form$ = this.bookingService.form$;
}
