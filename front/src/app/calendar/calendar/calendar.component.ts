import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  OnInit,
  inject,
} from '@angular/core';
import { DateTime, DateTimeUnit } from 'luxon';
import { CalendarService } from '../calendar.service';

@Component({
  template: '',
})
export abstract class CalendarComponent implements OnInit, OnChanges {
  @Input({ required: true }) shopUrl!: string;

  protected unit: DateTimeUnit = 'month';

  @Input() current: DateTime = DateTime.local().startOf(this.unit);

  today = DateTime.local().startOf('day');

  days: DateTime[] = [];

  private readonly calendarService = inject(CalendarService);

  ngOnInit(): void {
    this.calendarService.selectShop(this.shopUrl);

    this.generateDays();
  }

  ngOnChanges(): void {
    this.calendarService.selectShop(this.shopUrl);

    this.generateDays();
  }

  private generateDays(): void {
    this.days = [];

    let startDay = this.getStartDate();
    let endDay = this.getEndDate();

    this.calendarService.updateDateRange(startDay, endDay);

    for (let day = startDay; day <= endDay; day = day.plus({ days: 1 })) {
      this.days.push(day);
    }
  }

  protected getStartDate(): DateTime {
    return this.current.startOf(this.unit).startOf('week');
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
