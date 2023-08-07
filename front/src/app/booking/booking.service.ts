import { Injectable, inject } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { CustomerService } from '@app/customer/customer.service';
import { ShopService, Shop } from '@app/shop/shop.service';
import {
  Observable,
  combineLatest,
  map,
  tap,
  shareReplay,
  BehaviorSubject,
  distinctUntilChanged,
  switchMap,
  filter,
} from 'rxjs';
import { DetailsComponent } from './details/details.component';
import { FirstStepComponent } from './first-step/first-step.component';
import { Flash } from '@app/flash/flash.service';
import { inputConditionalRequiredValidator } from '@app/shared/custom-validators';
import { Location } from '@angular/common';
import { LocationComponent } from './location/location.component';

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly shopService = inject(ShopService);

  private readonly customerService = inject(CustomerService);

  public readonly shopUrlSubject = new BehaviorSubject<string | null>(null);

  public readonly shop$: Observable<any> = this.shopUrlSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(),
      filter(Boolean),
      switchMap((shopUrl) => this.shopService.getByUrl(shopUrl))
    );

  private readonly customer$ = this.customerService.getMine();

  public readonly form$ = combineLatest({
    shop: this.shop$,
    customer: this.customer$,
  }).pipe(
    map(({ shop, customer }) => {
      return new FormGroup(
        {
          'first-step': new FormGroup({
            types: new FormControl<string[]>([], [Validators.required]),
            is_first_tattoo: new FormControl<boolean>(false),
            is_cover_up: new FormControl<boolean>(false),
            is_post_operation_or_over_scar: new FormControl<boolean>(false),
            shop_conditions: new FormControl<string>(shop.description),
            conditions: new FormControl<boolean>(
              false,
              Validators.requiredTrue
            ),
          }),
          details: new FormGroup({
            name: new FormControl<string>('', [Validators.required]),
            additional_information: new FormControl<string>(''),
            illustrations: new FormControl<File[]>([], { nonNullable: true }),
          }),
          flashs: new FormControl<Flash[]>([], {
            nonNullable: true,
            validators: [Validators.required],
          }),
          location: new FormGroup({
            illustrations: new FormControl<File[]>([], { nonNullable: true }),
            zone: new FormControl<string>('', [Validators.required]),
            height_cm: new FormControl<number | null>(null, [
              Validators.required,
            ]),
            width_cm: new FormControl<number | null>(null, [
              Validators.required,
            ]),
          }),
          customer: new FormGroup({
            firstname: new FormControl<string>(customer?.firstname || '', {
              validators: [Validators.required],
              nonNullable: true,
            }),
            lastname: new FormControl<string>(customer?.lastname || '', {
              validators: [Validators.required],
              nonNullable: true,
            }),
            birthday: new FormControl<string | null>(
              customer?.birthday?.toISOString().substring(0, 10) || null,
              {
                validators: [Validators.required],
                nonNullable: true,
              }
            ),
            pronouns: new FormControl<string>(customer?.pronouns || ''),
            phone: new FormControl<string>(customer?.phone || ''),
            personal_information: new FormControl<string>(
              customer?.personal_information || ''
            ),
          }),
        },
        {
          validators: [
            inputConditionalRequiredValidator(
              ['first-step', 'types'],
              ['flashs'],
              (types: string[]) => {
                return types && types.includes('flashs');
              }
            ),
          ],
        }
      );
    }),
    shareReplay(1)
  );

  public readonly steps$: Observable<
    {
      formGroup: string;
      title: string;
      component: any;
      stepControl: any;
      completed: () => boolean;
    }[]
  > = this.form$.pipe(
    map((form) => {
      const steps = [
        {
          formGroup: 'first-step',
          title: 'BOOKING.first-step.title',
          component: FirstStepComponent,
          stepControl: form.get('first-step')!.get('is_first_tattoo')!, // dumb to avoid template complexity
        },
        {
          formGroup: 'details',
          title: 'BOOKING.details.title',
          component: DetailsComponent,
          stepControl: form.get('first-step')!,
        },
        {
          formGroup: 'location',
          title: 'BOOKING.location.title',
          component: LocationComponent,
          stepControl: form.get('details')!,
        },
        {
          formGroup: 'flashs',
          title: 'BOOKING.flashs.title',
          component: FirstStepComponent,
          stepControl: form.get('location')!,
        },
        {
          formGroup: 'customer',
          title: 'BOOKING.customer.title',
          component: FirstStepComponent,
          stepControl: form.get('customer')!,
        },
      ];

      return steps.map((step: any) => {
        step.completed = () => form.get(step.formGroup)?.valid;
        return step;
      });
    })
  );
}
