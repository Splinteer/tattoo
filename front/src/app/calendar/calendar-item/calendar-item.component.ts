import { Component, Input } from '@angular/core';
import { CalendarEvent } from '../calendar.service';
import { CommonModule } from '@angular/common';
import { ShortTimePipe } from '@app/shared/short-time.pipe';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'app-calendar-item',
  templateUrl: './calendar-item.component.html',
  styleUrls: ['./calendar-item.component.scss'],
  standalone: true,
  imports: [CommonModule, ShortTimePipe, TranslateModule],
})
export class CalendarItemComponent {
  @Input({ required: true }) event!: CalendarEvent;
}
