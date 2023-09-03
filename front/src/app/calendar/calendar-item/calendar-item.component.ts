import {
  Component,
  HostBinding,
  Input,
  OnInit,
  Signal,
  WritableSignal,
  booleanAttribute,
  computed,
  inject,
  signal,
} from '@angular/core';
import { CalendarEvent } from '../calendar.service';
import { CommonModule } from '@angular/common';
import { ShortTimePipe } from '@app/shared/short-time.pipe';
import { TranslateModule } from '@ngx-translate/core';
import { OverlayModule } from '@angular/cdk/overlay';
import { CalendarEventModalComponent } from '../calendar-event-modal/calendar-event-modal.component';
import { DateTime } from 'luxon';
import { CalendarSelectionService } from '../calendar-selection.service';
import { slideDown } from '@app/shared/animation';

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
  animations: [slideDown(250)],
})
export class CalendarItemComponent implements OnInit {
  private readonly calendarSelection = inject(CalendarSelectionService);

  public readonly selectionActive = this.calendarSelection.isActive;

  @Input({ required: true }) event!: CalendarEvent;

  @Input({ transform: booleanAttribute, alias: 'date' }) showDate = false;

  public isOpen = false;

  public selected: Signal<boolean> = signal(false);

  public hoursBetweenDates?: number;

  ngOnInit(): void {
    this.hoursBetweenDates = this.getHoursBetweenEventDates();
    this.selected = computed(() => {
      return !!this.calendarSelection.selectionObject()[this.event.id];
    });
  }

  public getHoursBetweenEventDates() {
    const start = DateTime.fromISO(this.event.start_time);
    const end = DateTime.fromISO(this.event.end_time);

    return end.diff(start, 'hours').hours;
  }

  click(event: Event) {
    event.stopPropagation();

    if (this.calendarSelection.isActive()) {
      this.calendarSelection.toggle(this.event.id);
    } else {
      this.isOpen = true;
    }
  }

  close(event?: Event) {
    if (event?.target instanceof HTMLElement) {
      const clickedInsideAppEvent = this.hasClickedAnotherEvent(event.target);
      if (!clickedInsideAppEvent) {
        event.stopPropagation();
      }
    }

    this.isOpen = false;
  }

  hasClickedAnotherEvent(parent: HTMLElement): boolean {
    let node: any = parent;
    const tagName = 'app-calendar-item'.toUpperCase();
    let found = false;

    while (node != null && !found) {
      if (node.tagName === tagName) {
        found = true;
        continue;
      }

      node = node.parentNode;
    }

    return found;
  }
}
