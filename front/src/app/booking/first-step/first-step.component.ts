import { Component } from '@angular/core';
import { BookingStepComponent } from '../booking-step/booking-step.component';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss'],
})
export class FirstStepComponent extends BookingStepComponent {}
