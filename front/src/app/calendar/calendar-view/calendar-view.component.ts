import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  OnInit,
  booleanAttribute,
  forwardRef,
  inject,
  signal,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarMonthlyComponent } from '../calendar-monthly/calendar-monthly.component';
import { CalendarWeeklyComponent } from '../calendar-weekly/calendar-weekly.component';
import { ToggleGroupComponent } from '@app/shared/toggle-group/toggle-group.component';
import { ToggleGroupItemComponent } from '@app/shared/ui/toggleGroup/toggle-group-item/toggle-group-item.component';
import { TranslateModule } from '@ngx-translate/core';
import { DateTime, DateTimeUnit } from 'luxon';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { CalendarSelectionService } from '../calendar-selection.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { tap } from 'rxjs';
import { CalendarService } from '../calendar.service';

type ControlValue = string[];
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
    ReactiveFormsModule,
  ],
  template: `
    <div *ngIf="showToggle">
      <app-toggle-group [(ngModel)]="view">
        <app-toggle-group-item value="week">{{
          'CALENDAR.UNIT.week' | translate
        }}</app-toggle-group-item>
        <app-toggle-group-item value="month">{{
          'CALENDAR.UNIT.month' | translate
        }}</app-toggle-group-item>
      </app-toggle-group>
    </div>

    <div class="view">
      <app-calendar-monthly
        [shopUrl]="shopUrl"
        [current]="minimumDate"
        *ngIf="view === 'month'"
      ></app-calendar-monthly>
      <app-calendar-weekly
        [shopUrl]="shopUrl"
        [current]="minimumDate"
        *ngIf="view === 'week'"
      ></app-calendar-weekly>
    </div>
  `,
  styleUrls: ['./calendar-view.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarViewComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarViewComponent implements ControlValueAccessor, OnDestroy {
  @Input({ required: true }) shopUrl!: string;

  @Input() view: DateTimeUnit = 'week';

  @Input({ transform: booleanAttribute }) showToggle = false;

  public minimumDate: DateTime = DateTime.local();

  public readonly calendarSelection = inject(CalendarSelectionService);
  private readonly calendarService = inject(CalendarService);

  #isUsedInForm = false;
  #selectionUpdater$ = this.calendarSelection.selection$.pipe(
    takeUntilDestroyed(),
    tap((value) => {
      this.writeValue(value, false);
      this.onChange(value);
    })
  );

  initSelection() {
    if (!this.#isUsedInForm) {
      this.#isUsedInForm = true;
      this.calendarService.selectShop(this.shopUrl);
      this.calendarSelection.setEditMode(true);
      this.calendarService
        .getMinimumAvailabilityDate(this.shopUrl)
        .subscribe((value) => {
          if (value) {
            this.minimumDate = DateTime.fromISO(value);
          }
        });
      this.#selectionUpdater$.subscribe();
    }
  }

  ngOnDestroy(): void {
    if (this.#isUsedInForm) {
      this.calendarSelection.setEditMode(false);
    }
  }

  // ControlValueAccessor

  public value?: ControlValue;

  @Input() disabled = false;

  public onChange: (value: ControlValue) => void = () => {};

  public onTouched: Function = () => {};

  private touched = false;

  public writeValue(value: ControlValue, updateService = true): void {
    this.value = value;

    if (updateService) {
      this.calendarSelection.set(value);
    }
  }

  public registerOnChange(
    fn: typeof CalendarViewComponent.prototype.onChange
  ): void {
    this.initSelection();
    this.onChange = fn;
  }

  public registerOnTouched(
    fn: typeof CalendarViewComponent.prototype.onTouched
  ): void {
    this.initSelection();
    this.onTouched = fn;
  }

  public setDisabledState?(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  public markAsTouched() {
    if (!this.touched) {
      this.onTouched();
      this.touched = true;
    }
  }
}
