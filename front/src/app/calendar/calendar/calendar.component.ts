import { Component, OnInit } from '@angular/core';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-calendar',
  templateUrl: './calendar.component.html',
  styleUrls: ['./calendar.component.scss'],
})
export class CalendarComponent implements OnInit {
  currentMonth: DateTime = DateTime.local().startOf('month');
  days: DateTime[] = [];

  constructor() {}

  ngOnInit(): void {
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
