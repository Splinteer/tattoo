import { Component, Input, inject } from '@angular/core';
import { BookingService } from '../booking.service';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss'],
})
export class FirstStepComponent {
  private readonly bookingService = inject(BookingService);

  public readonly form$ = this.bookingService.form$;
}
