import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarComponent } from '../calendar/calendar.component';
import { CalendarDayComponent } from '../calendar-day/calendar-day.component';

@Component({
  selector: 'app-calendar-monthly',
  standalone: true,
  imports: [CommonModule, CalendarDayComponent],
  templateUrl: '../calendar/calendar.component.html',
  styleUrls: ['../calendar/calendar.component.scss'],
})
export class CalendarMonthlyComponent extends CalendarComponent {}
