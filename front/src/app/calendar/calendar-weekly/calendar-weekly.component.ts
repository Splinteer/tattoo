import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../calendar/calendar.component';
import { CalendarDayComponent } from '../calendar-day/calendar-day.component';
import { DateTime, DateTimeUnit } from 'luxon';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar-weekly',
  standalone: true,
  imports: [CommonModule, CalendarDayComponent, TranslateModule],
  templateUrl: '../calendar/calendar.component.html',
  styleUrls: ['../calendar/calendar.component.scss'],
})
export class CalendarWeeklyComponent extends CalendarComponent {
  protected override unit = 'week' as DateTimeUnit;
}
