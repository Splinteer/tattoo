import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarMonthlyComponent } from '../calendar-monthly/calendar-monthly.component';
import { CalendarWeeklyComponent } from '../calendar-weekly/calendar-weekly.component';
import { ToggleGroupComponent } from '@app/shared/toggle-group/toggle-group.component';
import { ToggleGroupItemComponent } from '@app/shared/ui/toggleGroup/toggle-group-item/toggle-group-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateTimeUnit } from 'luxon';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-calendar-view',
  standalone: true,
  imports: [
    CommonModule,
    CalendarMonthlyComponent,
    CalendarWeeklyComponent,
    ToggleGroupComponent,
    ToggleGroupItemComponent,
    TranslateModule,
    FormsModule,
  ],
  template: `
    <div>
      <app-toggle-group [(ngModel)]="selectedView">
        <app-toggle-group-item value="week"> Semaine </app-toggle-group-item>
        <app-toggle-group-item value="month"> Mois </app-toggle-group-item>
      </app-toggle-group>
    </div>

    <div class="view">
      <app-calendar-monthly
        [shopUrl]="shopUrl"
        *ngIf="selectedView === 'month'"
      ></app-calendar-monthly>
      <app-calendar-weekly
        [shopUrl]="shopUrl"
        *ngIf="selectedView === 'week'"
      ></app-calendar-weekly>
    </div>
  `,
  styleUrls: ['./calendar-view.component.scss'],
})
export class CalendarViewComponent {
  @Input({ required: true }) shopUrl!: string;

  public selectedView: DateTimeUnit = 'week';
}
