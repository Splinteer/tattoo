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
  of,
  catchError,
} from 'rxjs';
import { DetailsComponent } from './details/details.component';
import { FirstStepComponent } from './first-step/first-step.component';
import { Flash, FlashService } from '@app/flash/flash.service';
import {
  atLeastOneControlSetValidator,
  inputConditionalRequiredValidator,
} from '@app/shared/custom-validators';
import { Location } from '@angular/common';
import { LocationComponent } from './location/location.component';
import { CustomerComponent } from './customer/customer.component';
import { FlashSelectionComponent } from './flash-selection/flash-selection.component';
import { AvailabilitySelectionComponent } from './availability-selection/availability-selection.component';
import { ActivatedRoute } from '@angular/router';
import { HttpService } from '@app/@core/http/http.service';

export interface BookingStep {
  formGroup: string;
  title: string;
  component: any;
  stepControl: any;
  submitted?: true;
  completed: () => boolean;
  show: () => boolean;
}

@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private readonly http = inject(HttpService);

  private readonly shopService = inject(ShopService);

  private readonly customerService = inject(CustomerService);

  private readonly route = inject(ActivatedRoute);

  public readonly flashService = inject(FlashService);

  public readonly shopUrlSubject = new BehaviorSubject<string | null>(null);

  public readonly shop$: Observable<any> = this.shopUrlSubject
    .asObservable()
    .pipe(
      distinctUntilChanged(),
      filter(Boolean),
      switchMap((shopUrl) => this.shopService.getByUrl(shopUrl))
    );

  private readonly customer$ = this.customerService.getMine();

  private readonly getPreselectedFlash$ = this.route.queryParamMap.pipe(
    switchMap((params) => {
      const flash = params.get('flash');
      if (!flash) {
        return of(null);
      }

      return this.flashService.get(flash).pipe(catchError(() => of(null)));
    })
  );

  public readonly form$ = combineLatest({
    shop: this.shop$,
    customer: this.customer$,
    flash: this.getPreselectedFlash$,
  }).pipe(
    map(({ shop, customer, flash }) => {
      return new FormGroup(
        {
          'first-step': new FormGroup({
            types: new FormControl<string[]>(flash ? ['flashs'] : [], [
              Validators.required,
            ]),
            is_first_tattoo: new FormControl<boolean>(false),
            is_cover_up: new FormControl<boolean>(false),
            is_post_operation_or_over_scar: new FormControl<boolean>(false),
            shop_conditions: new FormControl<string>(shop.booking_condition),
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
          flashs: new FormControl<Flash[]>(flash ? [flash] : [], {
            nonNullable: true,
            validators: [Validators.required],
          }),
          availability: new FormGroup(
            {
              availabilities: new FormControl<string[]>([], {
                nonNullable: true,
              }),
              customer_availability: new FormControl<string>('', {
                nonNullable: true,
              }),
            },
            { validators: [atLeastOneControlSetValidator()] }
          ),
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
            personal_information: new FormControl<string>(
              customer?.personal_information || ''
            ),

            address: new FormControl<string>(customer?.address || '', [
              Validators.required,
            ]),
            address2: new FormControl<string>(customer?.address2 || ''),
            city: new FormControl<string>(customer?.city || '', [
              Validators.required,
            ]),
            zipcode: new FormControl<string>(customer?.zipcode || '', [
              Validators.required,
            ]),
            phone: new FormControl<string>(customer?.phone || ''),

            twitter: new FormControl<string>(customer?.twitter || ''),
            instagram: new FormControl<string>(customer?.instagram || ''),
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

  public readonly steps$: Observable<BookingStep[]> = this.form$.pipe(
    map((form) => {
      const steps = [
        {
          formGroup: 'first-step',
          title: 'BOOKING.first-step.title',
          component: FirstStepComponent,
          stepControl: form.get(['first-step', 'is_first_tattoo'])!, // dumb to avoid template complexity
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
          component: FlashSelectionComponent,
          stepControl: form.get('location')!,
          show: () =>
            form.get(['first-step', 'types'])?.value.includes('flashs'),
        },
        {
          formGroup: 'availability',
          title: 'BOOKING.availability.title',
          component: AvailabilitySelectionComponent,
          stepControl: form.get('location')!,
        },
        {
          formGroup: 'customer',
          title: 'BOOKING.customer.title',
          component: CustomerComponent,
          stepControl: form.get('availability')!,
        },
      ];

      return steps.map((step: any) => {
        step.completed = () => form.get(step.formGroup)?.valid;
        return step;
      });
    })
  );

  public create() {
    return this.form$.pipe(
      switchMap((form) => {
        const formData = this.createFormData(form);
        const shopUrl = this.shopUrlSubject.getValue();
        if (!shopUrl) {
          throw new Error('Shop not defined');
        }

        return this.http.post('/booking/' + shopUrl, formData);
      })
    );
  }

  private createFormData(form: FormGroup) {
    const formData = new FormData();

    formData.append('name', form.get(['details', 'name'])?.getRawValue());
    formData.append('types', form.get(['first-step', 'types'])?.getRawValue());
    formData.append(
      'is_first_tattoo',
      form.get(['first-step', 'is_first_tattoo'])?.getRawValue()
    );
    formData.append(
      'is_cover_up',
      form.get(['first-step', 'is_cover_up'])?.getRawValue()
    );
    formData.append(
      'is_post_operation_or_over_scar',
      form.get(['first-step', 'is_post_operation_or_over_scar'])?.getRawValue()
    );
    formData.append('zone', form.get(['location', 'zone'])?.getRawValue());
    formData.append(
      'height_cm',
      form.get(['location', 'height_cm'])?.getRawValue()
    );
    formData.append(
      'width_cm',
      form.get(['location', 'width_cm'])?.getRawValue()
    );
    formData.append(
      'additional_information',
      form.get(['details', 'additional_information'])?.getRawValue()
    );
    formData.append(
      'customer_availability',
      form.get(['availability', 'customer_availability'])?.getRawValue()
    );

    formData.append(
      'customer_firstname',
      form.get(['customer', 'firstname'])?.getRawValue()
    );
    formData.append(
      'customer_lastname',
      form.get(['customer', 'lastname'])?.getRawValue()
    );
    formData.append(
      'customer_birthday',
      form.get(['customer', 'birthday'])?.getRawValue()
    );
    formData.append(
      'customer_pronouns',
      form.get(['customer', 'pronouns'])?.getRawValue()
    );
    formData.append(
      'customer_personal_information',
      form.get(['customer', 'personal_information'])?.getRawValue()
    );
    formData.append(
      'customer_address',
      form.get(['customer', 'address'])?.getRawValue()
    );
    formData.append(
      'customer_address2',
      form.get(['customer', 'address2'])?.getRawValue()
    );
    formData.append(
      'customer_city',
      form.get(['customer', 'city'])?.getRawValue()
    );
    formData.append(
      'customer_zipcode',
      form.get(['customer', 'zipcode'])?.getRawValue()
    );
    formData.append(
      'customer_phone',
      form.get(['customer', 'phone'])?.getRawValue()
    );
    formData.append(
      'customer_twitter',
      form.get(['customer', 'twitter'])?.getRawValue()
    );
    formData.append(
      'customer_instagram',
      form.get(['customer', 'instagram'])?.getRawValue()
    );

    const illustrations: File[] = form
      .get(['details', 'illustrations'])
      ?.getRawValue();
    illustrations.forEach((illustration, index) => {
      formData.append(`illustrations`, illustration);
    });

    const locations: File[] = form
      .get(['location', 'illustrations'])
      ?.getRawValue();
    locations.forEach((illustration, index) => {
      formData.append(`locations`, illustration);
    });

    const flashs: Flash[] = form.get('flashs')?.getRawValue();
    flashs.forEach((flash, index) => {
      formData.append(`flashs`, flash.id);
    });

    const availabilities: string[] = form
      .get(['availability', 'availabilities'])
      ?.getRawValue();
    availabilities.forEach((availability, index) => {
      formData.append(`availabilities`, availability);
    });

    return formData;
  }
}
