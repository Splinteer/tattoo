import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnInit,
  forwardRef,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormGroupDirective,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';

@Component({
  selector: 'app-icon-input',
  templateUrl: './icon-input.component.html',
  styleUrls: ['./icon-input.component.scss'],
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => IconInputComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class IconInputComponent implements ControlValueAccessor, OnInit {
  @Input() icon!: string;
  @Input() iconType: string = 'regular';

  @Input() id: string = `icon-${Math.floor(Math.random() * 100)}`;

  @Input() type: string = 'text';

  @Input() placeholder?: string;

  @Input() disabled = false;

  @Input() formControlName?: string;

  @Input() ngForm?: FormGroupDirective;

  public value?: string;

  ngOnInit(): void {
    if (this.formControlName) {
      this.id = this.formControlName;
    }
  }

  // ControlValueAccessor

  public onChange: any = () => {};

  public onTouched: any = () => {};

  private touched = false;

  public writeValue(value: string): void {
    this.value = value;
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
  public handleChange(event: Event): void {
    this.value = (event.target as HTMLInputElement).value;
    this.onChange(this.value);
    this.markAsTouched();
  }
}
