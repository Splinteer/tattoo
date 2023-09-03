import {
  Component,
  HostBinding,
  Input,
  OnInit,
  booleanAttribute,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShortTimePipe } from '@app/shared/short-time.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { DateTime } from 'luxon';
import { CalendarSelectionService } from '../calendar-selection.service';
import { CalendarEvent } from '../calendar.service';
import { CalendarItemComponent } from '../calendar-item/calendar-item.component';

@Component({
  selector: 'app-calendar-time-range',
  standalone: true,
  templateUrl: './calendar-time-range.component.html',
  styleUrls: ['./calendar-time-range.component.scss'],
  imports: [
    CommonModule,
    ShortTimePipe,
    TranslateModule,
    CalendarItemComponent,
  ],
})
export class CalendarTimeRangeComponent implements OnInit {
  public readonly selectionActive = inject(CalendarSelectionService).isActive;

  @Input({ required: true }) events!: CalendarEvent[];

  @Input({ transform: booleanAttribute, alias: 'date' }) showDate = false;

  @HostBinding('style.flex-basis') get flexBasis() {
    const hoursPerDay = 16;
    if (!this.selectionActive()) {
      const percentageValue =
        ((this.hoursBetweenDates ?? 0) / hoursPerDay) * 100;
      const result = Math.floor(percentageValue * 10) / 10;
      return `${result}%`;
    }
    return '1';
  }

  public hoursBetweenDates?: number;

  ngOnInit(): void {
    this.hoursBetweenDates = this.getHoursBetweenEventDates();
  }

  public getHoursBetweenEventDates() {
    const start = DateTime.fromISO(this.events[0].start_time);
    const end = DateTime.fromISO(this.events[0].end_time);

    return end.diff(start, 'hours').hours;
  }
}
