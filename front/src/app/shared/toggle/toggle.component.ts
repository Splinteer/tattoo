import { CommonModule } from '@angular/common';
import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type ControlValue = boolean | undefined;

@Component({
  selector: 'app-toggle',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div [class.right-toggle]="position === 'right'">
      <button
        type="button"
        [class.checked]="!!value"
        [class.disabled]="disabled"
        (click)="toggleValue()"
      >
        <span></span>
      </button>
      @if (text) {
      <label
        class="cursor-pointer"
        [class.bold]="bold"
        [class.invalid]="invalid"
        (click)="toggleValue()"
        >{{ text }}</label
      >
      }
    </div>
  `,
  styleUrls: ['./toggle.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleComponent),
      multi: true,
    },
  ],
})
export class ToggleComponent implements ControlValueAccessor {
  @Input() text?: string;

  @Input() bold?: boolean = false;

  @Input() invalid?: boolean = false;

  @Input() position?: 'left' | 'right' = 'left';

  public toggleValue(): void {
    this.writeValue(!this.value);
    this.onChange(this.value);
  }

  // ControlValueAccessor

  public value?: ControlValue;

  @Input() disabled = false;

  public onChange: (value: ControlValue) => void = () => {};

  public onTouched: () => unknown = () => {};

  private touched = false;

  public writeValue(value: ControlValue): void {
    this.value = value;
  }

  public registerOnChange(fn: typeof ToggleComponent.prototype.onChange): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: () => unknown): void {
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
