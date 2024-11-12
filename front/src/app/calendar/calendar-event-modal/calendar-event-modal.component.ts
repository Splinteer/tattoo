import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarEvent, CalendarService } from '../calendar.service';
import { TranslateModule } from '@ngx-translate/core';
import { slideDown } from '@app/shared/animation';
import { ToggleComponent } from '@app/shared/toggle/toggle.component';
import { CalendarFormEventComponent } from '../calendar-form-event/calendar-form-event.component';
import { DateTime } from 'luxon';
import { CalendarEvent as CalendarEventV2 } from '@app/project/project.service';

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

  @Input({
    required: true,
    transform: (event: CalendarEvent | CalendarEventV2) => {
      if ('startTime' in event) {
        return {
          id: event.id,
          shop_url: event.shopUrl,
          start_time: event.startTime,
          end_time: event.endTime,
          event_type: event.type,
          properties: {
            project_id: event.projectId,
            is_paid: false,
          },
        };
      }

      return event;
    },
  })
  event!: CalendarEvent;

  public readonly DateTime = DateTime;

  public edit = false;

  public remove() {
    // this.calendarService.remove(this.event);
  }
}
