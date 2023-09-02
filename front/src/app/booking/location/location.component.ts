import { Component } from '@angular/core';
import { BookingStepComponent } from '../booking-step/booking-step.component';

@Component({
  selector: 'app-booking-location',
  templateUrl: './location.component.html',
  styleUrls: ['./location.component.scss'],
})
export class LocationComponent extends BookingStepComponent {
  public readonly imagesPreview$ = this.getImagePreview([
    'location',
    'illustrations',
  ]);

  public removeImage = this.getRemoveImage(['location', 'illustrations']);
}
