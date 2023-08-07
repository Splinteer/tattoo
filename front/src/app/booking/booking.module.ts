import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './booking.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { SharedModule } from '@app/shared/shared.module';
import { FirstStepComponent } from './first-step/first-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { BookingService } from './booking.service';

@NgModule({
  declarations: [BookingComponent, FirstStepComponent, DetailsComponent],
  imports: [
    CommonModule,
    BookingRoutingModule,
    CdkStepperModule,
    SharedModule,
    ReactiveFormsModule,
  ],
})
export class BookingModule {}
