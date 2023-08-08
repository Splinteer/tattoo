import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { BookingRoutingModule } from './booking-routing.module';
import { BookingComponent } from './booking.component';
import { CdkStepperModule } from '@angular/cdk/stepper';
import { SharedModule } from '@app/shared/shared.module';
import { FirstStepComponent } from './first-step/first-step.component';
import { ReactiveFormsModule } from '@angular/forms';
import { DetailsComponent } from './details/details.component';
import { BookingService } from './booking.service';
import { LocationComponent } from './location/location.component';
import { CustomerComponent } from './customer/customer.component';

@NgModule({
  declarations: [
    BookingComponent,
    FirstStepComponent,
    DetailsComponent,
    LocationComponent,
    CustomerComponent,
  ],
  imports: [
    CommonModule,
    BookingRoutingModule,
    CdkStepperModule,
    SharedModule,
    ReactiveFormsModule,
  ],
  providers: [BookingService],
})
export class BookingModule {}
