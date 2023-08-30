import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormStepperComponent } from '@app/shared/form-stepper/form-stepper.component';
import { take } from 'rxjs';
import { BookingService, BookingStep } from './booking.service';

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
      return form.valueChanges.subscribe((value) => {
        // setTimeout(() => {
        //   console.log(form.get('flashs')?.hasError('input-condition'));
        // }, 500);

        console.log(value);
      });
    });
  }

  onSubmit(form: FormGroup, steps: BookingStep[]) {
    steps[this.stepper!.selectedIndex].submitted = true;

    if (!this.stepper?.steps.get(this.stepper.selectedIndex + 1)) {
      return;
    }

    if (
      this.stepper.steps.get(this.stepper.selectedIndex + 1)?.stepControl.valid
    ) {
      this.stepper?.next();
    }
  }
}
