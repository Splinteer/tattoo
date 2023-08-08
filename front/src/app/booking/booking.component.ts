import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormStepperComponent } from '@app/shared/form-stepper/form-stepper.component';
import { Shop, ShopService } from '@app/shop/shop.service';
import {
  Observable,
  combineLatest,
  map,
  switchMap,
  tap,
  take,
  lastValueFrom,
} from 'rxjs';
import { FirstStepComponent } from './first-step/first-step.component';
import { DetailsComponent } from './details/details.component';
import { CustomerService } from '@app/customer/customer.service';
import { BookingService } from './booking.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit {
  @ViewChild('stepper') stepper: FormStepperComponent | undefined;

  private readonly bookingService = inject(BookingService);

  private readonly paramMap = inject(ActivatedRoute).paramMap;

  public readonly shop$ = this.bookingService.shop$;

  public readonly form$ = this.bookingService.form$;

  public readonly steps$ = this.bookingService.steps$;

  ngOnInit() {
    this.paramMap
      .pipe(take(1))
      .subscribe((params) =>
        this.bookingService.shopUrlSubject.next(params.get('shopUrl'))
      );
    this.form$.subscribe((form) => {
      return form.get('first-step')?.valueChanges.subscribe((value) => {
        // setTimeout(() => {
        //   console.log(form.get('flashs')?.hasError('input-condition'));
        // }, 500);

        console.log(value);
      });
    });
  }

  onSubmit(form: FormGroup) {
    console.log(
      'oklm',
      !this.stepper?.steps.get(this.stepper.selectedIndex + 1)
    );
    if (!this.stepper?.steps.get(this.stepper.selectedIndex + 1)) {
      if (form.invalid) {
        console.log('invalid');
      }
      console.log('valid');

      return;
    }

    if (
      this.stepper.steps.get(this.stepper.selectedIndex + 1)?.stepControl.valid
    ) {
      this.stepper?.next();
    }
  }
}
