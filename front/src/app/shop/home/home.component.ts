import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { backInDown } from '@shared/animation';
import { CalendarComponent } from '@app/calendar/calendar/calendar.component';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-home',

  template: `<app-calendar></app-calendar> `,
  styles: [
    `
      :host {
        flex-grow: 1;
      }
    `,
  ],
  animations: [backInDown()],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, CalendarComponent, RouterModule],
})
export class HomeComponent {}
