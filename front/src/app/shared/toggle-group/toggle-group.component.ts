import {
  AfterContentInit,
  ChangeDetectionStrategy,
  Component,
  ContentChildren,
  Input,
  QueryList,
  forwardRef,
} from '@angular/core';
import { NG_VALUE_ACCESSOR, ControlValueAccessor } from '@angular/forms';
import { ToggleGroupItemComponent } from '../ui/toggleGroup/toggle-group-item/toggle-group-item.component';

@Component({
  selector: 'app-toggle-group',
  template: '<ng-content></ng-content>',
  styleUrls: ['./toggle-group.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => ToggleGroupComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
})
export class ToggleGroupComponent
  implements ControlValueAccessor, AfterContentInit
{
  @ContentChildren(ToggleGroupItemComponent)
  items!: QueryList<ToggleGroupItemComponent>;

  ngAfterContentInit() {
    this.items.forEach((item) => {
      item.selectedChange.subscribe(() => {
        this.writeValue(item.value);
        this.onChange(item.value);
      });
    });

    this.writeValue(this.value);
  }

  public value?: unknown;

  // ControlValueAccessor

  @Input() disabled = false;

  public onChange: any = () => {};

  public onTouched: any = () => {};

  private touched = false;

  public writeValue(value: unknown): void {
    this.value = value;
    if (this.items) {
      this.items.forEach((item) => {
        item.selected = item.value === value;
      });
    }
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

  // End ControlValueAccessor
}
