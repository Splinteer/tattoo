import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarItemComponent } from '../calendar-item/calendar-item.component';
import { DateTime } from 'luxon';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [CommonModule, CalendarItemComponent],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
})
export class CalendarDayComponent {
  @Input({ required: true }) day!: DateTime;

  @Input({ required: true }) today!: DateTime;

  private readonly calendarService = inject(CalendarService);

  public readonly events = this.calendarService.visibleEventsSignal;
}
