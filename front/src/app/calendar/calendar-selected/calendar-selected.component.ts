import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarItemComponent } from '../calendar-item/calendar-item.component';
import { CalendarSelectionService } from '../calendar-selection.service';
import { CalendarService } from '../calendar.service';

@Component({
  selector: 'app-calendar-selected',
  standalone: true,
  imports: [CommonModule, CalendarItemComponent],
  templateUrl: './calendar-selected.component.html',
  styleUrls: ['./calendar-selected.component.scss'],
})
export class CalendarSelectedComponent {
  public readonly loadedEventsByIdSignal =
    inject(CalendarService).loadedEventsByIdSignal;

  public readonly selection$ = inject(CalendarSelectionService).selection$;
}
