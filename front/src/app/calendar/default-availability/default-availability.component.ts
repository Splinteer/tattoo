import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormGroup,
  FormBuilder,
  FormArray,
  AbstractControl,
  FormControl,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  Observable,
  catchError,
  combineLatest,
  debounceTime,
  filter,
  map,
  of,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs';
import { AvailabilityService, Weekday } from '../availability.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-default-availability',
  templateUrl: './default-availability.component.html',
  styleUrls: ['./default-availability.component.scss'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
})
export class DefaultAvailabilityComponent {
  private readonly fb = inject(FormBuilder);
  private readonly availabilityService = inject(AvailabilityService);

  form$: Observable<FormGroup> = this.availabilityService
    .getDefaultAvailability()
    .pipe(
      map((dayGroupedAvailabilities) => {
        let defaultAvailabilities: FormArray;
        if (dayGroupedAvailabilities.length) {
          defaultAvailabilities = new FormArray(
            dayGroupedAvailabilities.map((availability) => {
              return new FormGroup({
                startDay: new FormControl<Weekday>(availability.startDay, {
                  validators: [Validators.required],
                  nonNullable: true,
                }),
                endDay: new FormControl<Weekday>(availability.endDay, {
                  validators: [Validators.required],
                  nonNullable: true,
                }),
                hourRanges: new FormArray(
                  availability.hourRanges.map(
                    (hourRange) =>
                      new FormGroup({
                        startTime: new FormControl(hourRange.startTime, {
                          validators: [Validators.required],
                          nonNullable: true,
                        }),
                        endTime: new FormControl(hourRange.endTime, {
                          validators: [Validators.required],
                          nonNullable: true,
                        }),
                      })
                  )
                ),
              });
            })
          );
        } else {
          defaultAvailabilities = new FormArray([
            new FormGroup({
              startDay: new FormControl<Weekday>(Weekday.Monday, {
                validators: [Validators.required],
                nonNullable: true,
              }),
              endDay: new FormControl<Weekday>(Weekday.Friday, {
                validators: [Validators.required],
                nonNullable: true,
              }),
              hourRanges: new FormArray([
                new FormGroup({
                  startTime: new FormControl('10:00', {
                    validators: [Validators.required],
                    nonNullable: true,
                  }),
                  endTime: new FormControl('12:00', {
                    validators: [Validators.required],
                    nonNullable: true,
                  }),
                }),
              ]),
            }),
          ]);
        }

        return new FormGroup({
          defaultAvailabilities,
        });
      }),
      shareReplay()
    );

  private readonly dbUpdated = this.form$
    .pipe(
      takeUntilDestroyed(),
      switchMap((form) =>
        combineLatest({ value: form.valueChanges, form: of(form) })
      ),
      debounceTime(300),
      filter(({ form }) => form.valid),
      switchMap(({ value }) =>
        this.availabilityService
          .updateDefaultAvailability(value.defaultAvailabilities)
          .pipe(
            catchError((error) => {
              console.error('Error updating availability:', error);
              return of(null); // This will return an Observable that completes without emitting any items.
              // So your outer pipe won't fail, and will keep listening to further changes in the form.
            })
          )
      )
    )
    .subscribe();

  weekdays = Object.values(Weekday).filter(
    (value) => typeof value === 'string'
  );

  defaultAvailabilities(form: FormGroup) {
    return form.get('defaultAvailabilities') as FormArray;
  }

  getHourRangesControls(dayAvailability: AbstractControl): AbstractControl[] {
    return (dayAvailability.get('hourRanges') as FormArray).controls;
  }

  addNewAvailability(form: FormGroup) {
    const availabilityGroup = this.fb.group({
      startDay: [Weekday.Monday],
      endDay: [Weekday.Sunday],
      hourRanges: this.fb.array([], [Validators.required]),
    });

    this.addHourRange(availabilityGroup);

    this.defaultAvailabilities(form).push(availabilityGroup);
  }

  addHourRange(dayAvailability: AbstractControl) {
    const hourRanges = dayAvailability.get('hourRanges') as FormArray;

    const previousTime =
      hourRanges.at(-1)?.value.endTime || hourRanges.at(-1)?.value.startTime;

    let startTime = previousTime || '09:00';
    const [startHour, startMinutes] = startTime.split(':');
    if (previousTime && Number(startHour) + 1 <= 23) {
      startTime = `${Number(startHour) + 1}:${startMinutes}`;
    }

    hourRanges.push(
      new FormGroup({
        startTime: new FormControl<string>(startTime, {
          validators: [
            Validators.required,
            Validators.pattern('([0-1]?[0-9]|2[0-3]):([0-5][0-9])'),
          ],
          nonNullable: true,
        }),
        endTime: new FormControl<string>('', {
          validators: [
            Validators.required,
            Validators.pattern('([0-1]?[0-9]|2[0-3]):([0-5][0-9])'),
          ],
          nonNullable: true,
        }),
      })
    );
  }

  getHourControl(
    dayAvailability: AbstractControl,
    controlName: string,
    index: number
  ) {
    const hourRanges = dayAvailability.get('hourRanges') as FormArray;
    return hourRanges.at(index).get(controlName);
  }

  removeDayRange(form: FormGroup, index: number) {
    this.defaultAvailabilities(form).removeAt(index);
  }

  removeHourRange(dayAvailability: AbstractControl, index: number) {
    const hourRanges = dayAvailability.get('hourRanges') as FormArray;
    hourRanges.removeAt(index);
  }
}
