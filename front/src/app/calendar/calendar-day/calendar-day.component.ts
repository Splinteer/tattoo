import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { DateTime } from 'luxon';
import { CalendarService } from '../calendar.service';
import { OverlayModule } from '@angular/cdk/overlay';
import { CalendarFormEventComponent } from '../calendar-form-event/calendar-form-event.component';
import { TranslateModule } from '@ngx-translate/core';
import { CalendarSelectionService } from '../calendar-selection.service';
import { CalendarTimeRangeComponent } from '../calendar-time-range/calendar-time-range.component';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [
    CommonModule,
    CalendarTimeRangeComponent,
    OverlayModule,
    CalendarFormEventComponent,
    TranslateModule,
  ],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarDayComponent {
  @Input({ required: true }) day!: DateTime;

  @Input({ required: true }) today!: DateTime;

  public isOpen = signal(false);

  private readonly calendarService = inject(CalendarService);
  private readonly selectionService = inject(CalendarSelectionService);

  public readonly events = this.calendarService.visibleEventsSignal;

  click(event: Event) {
    if (this.selectionService.isActive()) {
      event.stopPropagation();
    } else {
      this.isOpen.set(true);
    }
  }

  public closeModal(event: Event) {
    event.stopPropagation();
    this.isOpen.set(false);
  }
}
