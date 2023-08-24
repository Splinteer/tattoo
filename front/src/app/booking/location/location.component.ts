import { Component } from '@angular/core';
import { BookingStepComponent } from '../booking-step/booking-step.component';

@Component({
  selector: 'app-booking-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent extends BookingStepComponent {
  public readonly imagesPreview$ = this.getImagePreview([
    'details',
    'illustrations',
  ]);

  public removeImage = this.getRemoveImage(['details', 'illustrations']);
}
