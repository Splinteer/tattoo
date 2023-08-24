import { Component } from '@angular/core';
import { BookingStepComponent } from '../booking-step/booking-step.component';

@Component({
  selector: 'app-booking-details',
  templateUrl: './details.component.html',
  styleUrls: ['./details.component.scss'],
})
export class DetailsComponent extends BookingStepComponent {
  public readonly imagesPreview$ = this.getImagePreview([
    'details',
    'illustrations',
  ]);

  public removeImage = this.getRemoveImage(['details', 'illustrations']);
}
