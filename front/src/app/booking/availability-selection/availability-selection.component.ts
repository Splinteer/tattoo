import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarViewComponent } from '@app/calendar/calendar-view/calendar-view.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingStepComponent } from '../booking-step/booking-step.component';
import { CalendarSelectedComponent } from '@app/calendar/calendar-selected/calendar-selected.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-availability-selection',
  standalone: true,
  imports: [
    CommonModule,
    CalendarViewComponent,
    ReactiveFormsModule,
    CalendarSelectedComponent,
    TranslateModule,
  ],
  templateUrl: './availability-selection.component.html',
  styleUrls: ['./availability-selection.component.scss'],
})
export class AvailabilitySelectionComponent extends BookingStepComponent {}
