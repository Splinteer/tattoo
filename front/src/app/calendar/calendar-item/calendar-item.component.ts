import { Component, HostBinding, Input, OnInit, inject } from '@angular/core';
import { CalendarEvent } from '../calendar.service';
import { CommonModule } from '@angular/common';
import { ShortTimePipe } from '@app/shared/short-time.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CalendarEventModalComponent } from '../calendar-event-modal/calendar-event-modal.component';
import { DomSanitizer } from '@angular/platform-browser';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-calendar-item',
  templateUrl: './calendar-item.component.html',
  styleUrls: ['./calendar-item.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ShortTimePipe,
    TranslateModule,
    OverlayModule,
    CalendarEventModalComponent,
  ],
})
export class CalendarItemComponent implements OnInit {
  private readonly sanitizer = inject(DomSanitizer);

  @Input({ required: true }) event!: CalendarEvent;

  @HostBinding('style.flex-basis') get flexBasis() {
    const percentageValue = ((this.hoursBetweenDates ?? 0) / 24) * 100;
    const result = Math.floor(percentageValue * 10) / 10;
    return `${result}%`;
  }

  public isOpen = false;

  public hoursBetweenDates?: number;

  ngOnInit(): void {
    this.hoursBetweenDates = this.getHoursBetweenEventDates();
  }

  public getHoursBetweenEventDates() {
    const start = DateTime.fromISO(this.event.start_time);
    const end = DateTime.fromISO(this.event.end_time);

    return end.diff(start, 'hours').hours;
  }

  showEdit(event: Event) {
    event.stopPropagation();

    this.isOpen = true;
  }
}
