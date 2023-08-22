import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarService } from '../calendar.service';
import { TranslateModule } from '@ngx-translate/core';
import { slideDown } from '@app/shared/animation';
import { ToggleComponent } from '@app/shared/toggle/toggle.component';
import { CalendarFormEventComponent } from '../calendar-form-event/calendar-form-event.component';
import { DateTime } from 'luxon';

@Component({
  selector: 'app-calendar-event-modal',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ToggleComponent,
    CalendarFormEventComponent,
  ],
  templateUrl: './calendar-event-modal.component.html',
  styleUrls: ['./calendar-event-modal.component.scss'],
  animations: [slideDown()],
})
export class CalendarEventModalComponent {
  private readonly calendarService = inject(CalendarService);

  @Output() close = new EventEmitter();

  @Input({ required: true }) event!: CalendarEvent;

  public readonly DateTime = DateTime;

  public edit = false;

  public remove() {
    this.calendarService.remove(this.event);
  }
}
