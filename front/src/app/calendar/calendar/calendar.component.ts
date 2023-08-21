import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { DateTime } from 'luxon';
import { CalendarService } from '../calendar.service';
import { CalendarDayComponent } from '../calendar-day/calendar-day.component';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
  standalone: true,
  imports: [CommonModule, CalendarDayComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarComponent implements OnInit {
  @Input({ required: true }) shopId!: string;

  currentMonth: DateTime = DateTime.local().startOf('month');

  today = DateTime.local().startOf('day');

  days: DateTime[] = [];

  private readonly calendarService = inject(CalendarService);

  ngOnInit(): void {
    this.calendarService.selectShop(this.shopId);
    this.calendarService.updateDateRange(
      this.currentMonth,
      this.currentMonth.endOf('month')
    );

    this.generateDays();
  }

  generateDays(): void {
    this.days = [];

    let startDay = this.currentMonth.startOf('week');
    let endDay = this.currentMonth.endOf('month').endOf('week');

    for (let day = startDay; day <= endDay; day = day.plus({ days: 1 })) {
      this.days.push(day);
    }
  }

  previousMonth(): void {
    this.currentMonth = this.currentMonth.minus({ months: 1 });
    this.generateDays();
  }

  nextMonth(): void {
    this.currentMonth = this.currentMonth.plus({ months: 1 });
    this.generateDays();
  }
}
