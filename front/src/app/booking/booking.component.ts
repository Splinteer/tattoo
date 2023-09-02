import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { AbstractControl, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FormStepperComponent } from '@app/shared/form-stepper/form-stepper.component';
import { combineLatest, take } from 'rxjs';
import { BookingService, BookingStep } from './booking.service';
import { CredentialsService } from '@app/auth/credentials.service';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit {
  @ViewChild('stepper') stepper: FormStepperComponent | undefined;

  private readonly router = inject(Router);

  private readonly credentials$ = inject(CredentialsService).credentials$;

  private readonly paramMap = inject(ActivatedRoute).paramMap;

  private readonly bookingService = inject(BookingService);

  public readonly shop$ = this.bookingService.shop$;

  public readonly form$ = this.bookingService.form$;

  public readonly steps$ = this.bookingService.steps$;

  ngOnInit() {
    combineLatest({
      credentials: this.credentials$,
      params: this.paramMap,
    })
      .pipe(take(1))
      .subscribe(({ params, credentials }) => {
        const shopUrl = params.get('shopUrl');
        if (credentials?.shop_url === shopUrl) {
          this.router.navigate(['shop', shopUrl]);
          return;
        }

        this.bookingService.shopUrlSubject.next(shopUrl);
      });
  }

  onSubmit(form: FormGroup, steps: BookingStep[]) {
    steps[this.stepper!.selectedIndex].submitted = true;

    if (!this.stepper?.steps.get(this.stepper.selectedIndex + 1)) {
      if (form.invalid) {
        return;
      }

      this.bookingService.create().subscribe();
      return;
    }

    if (
      this.stepper.steps.get(this.stepper.selectedIndex + 1)?.stepControl.valid
    ) {
      this.stepper?.next();
      return;
    }
  }
}
