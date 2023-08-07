import { Component, ViewChild, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { FormStepperComponent } from '@app/shared/form-stepper/form-stepper.component';
import { Shop, ShopService } from '@app/shop/shop.service';
import { Observable, switchMap, tap } from 'rxjs';
import { FirstStepComponent } from './first-step/first-step.component';
import { DetailsComponent } from './details/details.component';

@Component({
  selector: 'app-booking',
  templateUrl: './booking.component.html',
  styleUrls: ['./booking.component.scss'],
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BookingComponent implements OnInit {
  @ViewChild('stepper') stepper: FormStepperComponent | undefined;

  private readonly route = inject(ActivatedRoute);

  private readonly shopService = inject(ShopService);

  public readonly form = new FormGroup({
    'first-step': new FormGroup({
      types: new FormControl<string[]>(['flashs'], [Validators.required]),
      is_first_tattoo: new FormControl<boolean>(false),
      is_cover_up: new FormControl<boolean>(false),
      is_post_operation_or_over_scar: new FormControl<boolean>(false),
      shop_conditions: new FormControl<string>(''),
      conditions: new FormControl<boolean>(false, Validators.requiredTrue),
    }),
  });

  public readonly steps = [
    {
      formGroup: 'first-step',
      title: 'Premier pas',
      component: FirstStepComponent,
      stepControl: this.form.get('first-step')!.get('is_first_tattoo')!, // dumb to avoid template complexity
    },
    {
      formGroup: 'first-second',
      title: 'Détails',
      component: DetailsComponent,
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Emplacement',
      component: FirstStepComponent,
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Flashs',
      component: FirstStepComponent,
      stepControl: this.form.get('first-step')!,
    },
    {
      formGroup: 'first-second',
      title: 'Information personnelles',
      component: FirstStepComponent,
      stepControl: this.form.get('first-step')!,
    },
  ];

  public readonly shop$: Observable<Shop> = this.route.params.pipe(
    switchMap(({ shopUrl }) => this.shopService.getByUrl(shopUrl)),
    tap((shop) => {
      this.form
        .get('first-step')
        ?.get('shop_conditions')
        ?.setValue(shop.description, { emitEvent: false }); // TODO
    })
  );

  ngOnInit() {
    this.form
      .get('first-step')
      ?.valueChanges.subscribe((value) => console.log(value));
  }

  onSubmit() {
    if (
      !this.stepper?.steps.get(this.stepper.selectedIndex + 1) ||
      this.stepper.steps.get(this.stepper.selectedIndex + 1)?.stepControl.valid
    ) {
      this.stepper?.next();
    }
  }
}
