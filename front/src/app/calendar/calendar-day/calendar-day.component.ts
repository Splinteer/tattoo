import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarItemComponent } from '../calendar-item/calendar-item.component';
import { DateTime } from 'luxon';
import { CalendarEvent, CalendarService } from '../calendar.service';
import { slideDown } from '@app/shared/animation';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [CommonModule, CalendarItemComponent],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
  animations: [slideDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayComponent {
  @Input({ required: true }) day!: DateTime;

  @Input({ required: true }) today!: DateTime;

  private readonly calendarService = inject(CalendarService);

  public readonly events = this.calendarService.visibleEventsSignal;

  public addEvent() {}

  public isAllDay(event: CalendarEvent) {
    const start = DateTime.fromISO(event.start_time);
    const end = DateTime.fromISO(event.end_time);
    return end.diff(start, 'minutes').minutes >= 1439;
  }
}
