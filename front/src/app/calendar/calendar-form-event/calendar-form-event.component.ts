import { CalendarService, EventType } from '../calendar.service';
import {
  ChangeDetectionStrategy,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleComponent } from '@app/shared/toggle/toggle.component';
import { CalendarEvent } from '../calendar.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { minDateValidator } from '@app/shared/custom-validators';

@Component({
  selector: 'app-calendar-form-event',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    TranslateModule,
    ToggleComponent,
    TranslateModule,
  ],
  templateUrl: './calendar-form-event.component.html',
  styleUrls: ['./calendar-form-event.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarFormEventComponent implements OnChanges {
  private readonly calendarService = inject(CalendarService);

  @Input() day?: DateTime;

  @Input() event?: CalendarEvent;

  @Output() close = new EventEmitter<boolean>();

  public readonly today = DateTime.now();

  ngOnChanges(): void {
    this.setFormValue();
  }

  public form?: FormGroup = new FormGroup({
    type: new FormControl<EventType>(EventType.UNAVAILABILITY, {
      validators: [Validators.required],
      nonNullable: true,
    }),
    date: new FormControl<string>('', {
      validators: [
        Validators.required,
        minDateValidator(this.today.toJSDate()),
      ],
      nonNullable: true,
    }),
    startTime: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    endTime: new FormControl<string>('', {
      validators: [Validators.required],
      nonNullable: true,
    }),
    allDay: new FormControl<boolean>(false, { nonNullable: true }),
  });

  allDayTrigger = this.form
    ?.get('allDay')
    ?.valueChanges.pipe(
      takeUntilDestroyed(),
      tap((value) => {
        if (value) {
          this.form?.patchValue({
            startTime: '00:00',
            endTime: '23:59',
          });
        }
      }),
    )
    .subscribe();

  public setFormValue() {
    if (this.event) {
      const start = DateTime.fromISO(this.event.start_time);
      const end = DateTime.fromISO(this.event.end_time);

      this.form?.setValue({
        type: this.event.event_type,
        date: start.toISODate(),
        startTime: start.toFormat('H:mm'),
        endTime: end.toFormat('H:mm'),
        allDay: end.diff(start, 'minutes').minutes >= 1439,
      });
    } else if (this.day) {
      this.form?.patchValue({
        date: this.day.toISODate(),
      });
    }
  }

  public submit() {
    if (!this.form || this.form?.invalid) {
      return;
    }

    const { date, startTime, endTime } = this.form.getRawValue();

    const start_time = DateTime.fromFormat(
      `${date} ${startTime}`,
      'yyyy-MM-dd H:mm',
    ).toISO() as string;
    const end_time = DateTime.fromFormat(
      `${date} ${endTime}`,
      'yyyy-MM-dd H:mm',
    ).toISO() as string;

    if (this.event) {
      this.calendarService.update(
        {
          ...this.event,
          start_time,
          end_time,
        },
        this.event.start_time,
      );
    } else {
      this.calendarService.add({
        start_time,
        end_time,
        event_type: this.form.get('type')?.getRawValue(),
      });
    }

    this.close.emit(true);
  }

  reset() {
    this.close.emit(false);
  }
}
