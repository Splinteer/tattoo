import { Component, Input, forwardRef } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';

type ControlValue<T> = T | T[] | undefined;

@Component({
  selector: 'app-icon-select',
  template: `
    @for (item of items; track item.icon) {
    <button
      type="button"
      class="input-container"
      (click)="toggle(item)"
      [class.active]="item.active"
      [class.disabled]="disabled"
      [class.invalid]="invalid"
    >
      <i [ngClass]="item.icon"></i>
      {{ item.text }}
    </button>
    }
  `,
  styleUrls: ['./icon-select.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconSelectComponent),
      multi: true,
    },
  ],
})
export class IconSelectComponent<T> implements ControlValueAccessor {
  @Input({ required: true }) items!: {
    icon: string;
    text: string;
    value: T;
    active?: boolean;
  }[];

  @Input() multi?: boolean = false;

  @Input() invalid?: boolean = false;

  public value?: ControlValue<T>;

  public toggle(toggledItem: (typeof IconSelectComponent.prototype.items)[0]) {
    toggledItem.active = !toggledItem.active;
    if (!this.multi) {
      this.items.forEach((item) => {
        item.active =
          item.value === toggledItem.value ? !toggledItem.active : false;
      });
    }

    const value = this.items
      .filter((item) => item.active)
      .map((item) => item.value);

    this.markAsTouched();
    this.writeValue(this.multi ? value : value.at(0), true);
    this.onChange(this.value);
  }

  // ControlValueAccessor

  @Input() disabled = false;

  public onChange: (value: ControlValue<T>) => void = () => {};

  public onTouched: () => unknown = () => {};

  private touched = false;

  public writeValue(value: ControlValue<T>, ignoreRefresh?: true): void {
    this.value = value;

    if (!ignoreRefresh) {
      this.items.forEach((item) => {
        item.active =
          item.value === this.value ||
          (Array.isArray(this.value) && this.value.includes(item.value));
      });
    }
  }

  public registerOnChange(
    fn: typeof IconSelectComponent.prototype.onChange,
  ): void {
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
