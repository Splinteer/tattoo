import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  inject,
} from '@angular/core';
import { DateTime, DateTimeUnit } from 'luxon';
import { CalendarService } from '../calendar.service';

@Component({
  template: '',
})
export abstract class CalendarComponent implements OnInit {
  @Input({ required: true }) shopUrl!: string;

  protected unit: DateTimeUnit = 'month';

  current: DateTime = DateTime.local().startOf(this.unit);

  today = DateTime.local().startOf('day');

  days: DateTime[] = [];

  private readonly calendarService = inject(CalendarService);

  ngOnInit(): void {
    this.calendarService.selectShop(this.shopUrl);

    this.generateDays();
  }

  private generateDays(): void {
    this.days = [];

    let startDay = this.getStartDate();
    let endDay = this.getEndDate();

    console.log(startDay.toISODate(), endDay.toISODate());

    this.calendarService.updateDateRange(
      this.current.startOf('week'),
      this.current.endOf(this.unit).endOf('week')
    );

    for (let day = startDay; day <= endDay; day = day.plus({ days: 1 })) {
      this.days.push(day);
    }
  }

  protected getStartDate(): DateTime {
    return this.current.startOf('week');
  }

  protected getEndDate(): DateTime {
    return this.current.endOf(this.unit).endOf('week');
  }

  previous(): void {
    this.current = this.current.minus({ [this.unit]: 1 });
    this.generateDays();
  }

  next(): void {
    this.current = this.current.plus({ [this.unit]: 1 });
    this.generateDays();
  }
}
