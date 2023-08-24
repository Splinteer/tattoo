import {
  ChangeDetectionStrategy,
  Component,
  Input,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarItemComponent } from '../calendar-item/calendar-item.component';
import { DateTime } from 'luxon';
import { CalendarService } from '../calendar.service';
import { slideDown } from '@app/shared/animation';
import { OverlayModule } from '@angular/cdk/overlay';
import { CalendarFormEventComponent } from '../calendar-form-event/calendar-form-event.component';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar-day',
  standalone: true,
  imports: [
    CommonModule,
    CalendarItemComponent,
    OverlayModule,
    CalendarFormEventComponent,
    TranslateModule,
  ],
  templateUrl: './calendar-day.component.html',
  styleUrls: ['./calendar-day.component.scss'],
  animations: [slideDown()],
})
export class CalendarDayComponent {
  @Input({ required: true }) day!: DateTime;

  @Input({ required: true }) today!: DateTime;

  public isOpen = signal(false);

  private readonly calendarService = inject(CalendarService);

  public readonly events = this.calendarService.visibleEventsSignal;

  public closeModal(event: Event) {
    event.stopPropagation();
    this.isOpen.set(false);
  }
}
