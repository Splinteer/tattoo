import { Component } from '@angular/core';
import { BookingStepComponent } from '../booking-step/booking-step.component';

@Component({
  selector: 'app-booking-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent extends BookingStepComponent {}
