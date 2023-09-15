import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../calendar/calendar.component';
import { CalendarDayComponent } from '../calendar-day/calendar-day.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar-monthly',
  standalone: true,
  imports: [CommonModule, CalendarDayComponent, TranslateModule],
  templateUrl: '../calendar/calendar.component.html',
  styleUrls: ['../calendar/calendar.component.scss'],
})
export class CalendarMonthlyComponent extends CalendarComponent {}
