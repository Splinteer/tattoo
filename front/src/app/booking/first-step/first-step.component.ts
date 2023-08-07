import { Component, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { BookingComponent } from '../booking.component';

@Component({
  selector: 'app-first-step',
  templateUrl: './first-step.component.html',
  styleUrls: ['./first-step.component.scss'],
})
export class FirstStepComponent {
  @Input({ required: true }) form!: typeof BookingComponent.prototype.form;
}
