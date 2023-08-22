import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarService } from '../calendar.service';
import { TranslateModule } from '@ngx-translate/core';
import {
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { DateTime } from 'luxon';
import { slideDown } from '@app/shared/animation';
import { ToggleComponent } from '@app/shared/toggle/toggle.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';

@Component({
  selector: 'app-calendar-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    ToggleComponent,
  ],
  templateUrl: './calendar-event-modal.component.html',
  styleUrls: ['./calendar-event-modal.component.scss'],
  animations: [slideDown()],
})
export class CalendarEventModalComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);

  @Output() close = new EventEmitter();

  @Input({ required: true }) event!: CalendarEvent;

  public edit = true;

  public form?: FormGroup = new FormGroup({
    date: new FormControl<string>('', {
      validators: [Validators.required],
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

  test = this.form
    ?.get('allDay')
    ?.valueChanges.pipe(
      takeUntilDestroyed(),
      tap((value) => {
        console.log(value);
        if (value) {
          this.form?.patchValue({
            startTime: '00:00',
            endTime: '23:59',
          });
        }
      })
    )
    .subscribe();

  ngOnInit(): void {
    this.setFormValue();
  }

  public setFormValue() {
    const start = DateTime.fromISO(this.event.start_time);
    const end = DateTime.fromISO(this.event.end_time);

    this.form?.setValue({
      date: new Date(this.event.start_time).toISOString().substring(0, 10),
      startTime: start.toFormat('hh:mm'),
      endTime: end.toFormat('hh:mm'),
      allDay: end.diff(start, 'minutes').minutes >= 1439,
    });
  }

  public reset() {
    this.edit = false;
    this.setFormValue();
  }

  public submit() {
    if (this.form?.invalid) {
      return;
    }

    const { date, startTime, endTime } = this.form?.getRawValue();

    const start_time = DateTime.fromFormat(
      `${date} ${startTime}`,
      'yyyy-MM-dd hh:mm'
    ).toISO() as string;
    const end_time = DateTime.fromFormat(
      `${date} ${endTime}`,
      'yyyy-MM-dd hh:mm'
    ).toISO() as string;

    this.calendarService.update({
      ...this.event,
      start_time,
      end_time,
    });
    this.edit = false;
  }

  public remove() {
    this.calendarService.remove(this.event);
  }
}
