import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnDestroy,
  forwardRef,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { DateTime } from 'luxon';
import { tap } from 'rxjs';
import { CalendarSelectionService } from '../calendar-selection.service';
import { CalendarService } from '../calendar.service';

type ControlValue = string[];

@Component({
  selector: 'app-calendar-selection',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './calendar-selection.component.html',
  styleUrls: ['./calendar-selection.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => CalendarSelectionComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CalendarSelectionComponent
  implements ControlValueAccessor, OnDestroy
{
  @Input({ required: true }) shopUrl!: string;

  private readonly calendarService = inject(CalendarService);
  private readonly calendarSelection = inject(CalendarSelectionService);

  #isUsedInForm = false;
  #selectionUpdater$ = this.calendarSelection.selection$.pipe(
    takeUntilDestroyed(),
    tap((value) => {
      this.writeValue(value);
      this.onChange(value);
    })
  );

  initSelection() {
    if (!this.#isUsedInForm) {
      this.#isUsedInForm = true;
      this.calendarService.updateDateRange(
        DateTime.local(),
        DateTime.local().plus({ month: 4 })
      );
      this.calendarSelection.setEditMode(true);
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

  public writeValue(value: ControlValue): void {
    this.value = value;
  }

  public registerOnChange(
    fn: typeof CalendarSelectionComponent.prototype.onChange
  ): void {
    this.initSelection();
    this.onChange = fn;
  }

  public registerOnTouched(
    fn: typeof CalendarSelectionComponent.prototype.onTouched
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
