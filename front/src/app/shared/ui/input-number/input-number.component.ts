import { NgClass } from '@angular/common';
import { Component, Input, OnInit, forwardRef } from '@angular/core';
import {
  ControlValueAccessor,
  NG_VALUE_ACCESSOR,
  FormControl,
} from '@angular/forms';

@Component({
  selector: 'app-input-number',
  templateUrl: './input-number.component.html',
  styleUrls: ['./input-number.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => InputNumberComponent),
      multi: true,
    },
  ],
})
export class InputNumberComponent implements ControlValueAccessor {
  private actualValue?: number;

  public displayValue = new FormControl<string>('');

  private touched = false;

  public onChange: any = () => {};

  public onTouched: any = () => {};

  @Input() placeholder?: string;

  @Input() disabled = false;

  @Input() ngClass: NgClass['ngClass'];

  public writeValue(value: number): void {
    this.actualValue = value;
    this.displayValue.setValue(this.format(value));
  }

  public registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  public registerOnTouched(fn: any): void {
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

  onValueChange(event: Event): void {
    let value = this.parse(<string>this.displayValue.value);
    this.actualValue = value;
    this.displayValue.setValue(this.format(value), { emitEvent: false });
    this.onChange(this.actualValue);
  }

  private format(value: number | null): string {
    return (value ?? '').toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  }

  private parse(value: string): number {
    return Number(value.replace(/[^0-9]/g, ''));
  }
}
