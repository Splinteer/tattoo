import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DateTime } from 'luxon';
import {
  dateRangeValidator,
  minDateValidator,
} from '@app/shared/custom-validators';
import { AvailabilityService } from '@app/calendar/availability.service';

@Component({
  selector: 'app-generate-availability',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './generate-availability.component.html',
  styleUrls: ['./generate-availability.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GenerateAvailabilityComponent {
  private readonly availabilityService = inject(AvailabilityService);

  public readonly today = DateTime.now();

  public submitted = signal(false);

  public readonly form = new FormGroup(
    {
      start_day: new FormControl<string>(this.today.toISODate()!, {
        validators: [
          Validators.required,
          minDateValidator(this.today.toJSDate()),
        ],
        nonNullable: true,
      }),
      end_day: new FormControl<string>(
        this.today.plus({ day: 7 }).toISODate()!,
        {
          validators: [Validators.required],
          nonNullable: true,
        }
      ),
    },
    { validators: dateRangeValidator('start_day', 'end_day') }
  );

  public submit() {
    if (this.form.invalid || this.submitted()) {
      return;
    }

    this.availabilityService
      .generateAvailability(this.form.getRawValue())
      .subscribe(() => this.submitted.set(true));
  }
}
