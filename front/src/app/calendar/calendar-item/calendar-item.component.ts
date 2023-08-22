import { Component, Input } from '@angular/core';
import { CalendarEvent } from '../calendar.service';
import { CommonModule } from '@angular/common';
import { ShortTimePipe } from '@app/shared/short-time.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CalendarEventModalComponent } from '../calendar-event-modal/calendar-event-modal.component';

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
export class CalendarItemComponent {
  @Input({ required: true }) event!: CalendarEvent;

  @Input() isAllDay = false;

  public isOpen = false;
}
