import { Component, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedModule } from '@app/shared/shared.module';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { backInDown, slideDown } from '@app/shared/animation';
import { AutomaticAvailabilityTimeUnit } from '../shop.service';
import { AvailabilityService } from '@app/calendar/availability.service';
import { debounceTime, filter, switchMap, tap } from 'rxjs';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'app-automatic-availability-settings',
  standalone: true,
  imports: [CommonModule, SharedModule, ReactiveFormsModule],
  templateUrl: './automatic-availability-settings.component.html',
  styleUrls: ['./automatic-availability-settings.component.scss'],
  animations: [slideDown(), backInDown()],
})
export class AutomaticAvailabilitySettingsComponent {
  private readonly availabilityService = inject(AvailabilityService);

  public form = computed(() => {
    const settings = this.availabilityService.settings();

    return new FormGroup({
      auto_generate_availability: new FormControl<boolean>(
        settings?.auto_generate_availability ?? false,
        {
          nonNullable: true,
        }
      ),
      repeat_availability_every: new FormControl<number>(
        settings?.repeat_availability_every ?? 1,
        {
          nonNullable: true,
        }
      ),
      repeat_availability_time_unit:
        new FormControl<AutomaticAvailabilityTimeUnit>(
          settings?.repeat_availability_time_unit ??
            AutomaticAvailabilityTimeUnit.week,
          {
            nonNullable: true,
          }
        ),
      min_appointment_time: new FormControl<number>(
        settings?.min_appointment_time ?? 1,
        {
          nonNullable: true,
          validators: [Validators.required],
        }
      ),
    });
  });

  private readonly update = toObservable(this.form)
    .pipe(
      takeUntilDestroyed(),
      switchMap((form) => form.valueChanges),
      debounceTime(300),
      filter(() => this.form().valid),
      switchMap(() =>
        this.availabilityService.updateSettings(this.form().getRawValue())
      )
    )
    .subscribe();
}
