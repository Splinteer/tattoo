import {
  FormGroup,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
} from '@angular/forms';

// Custom validator to check if one control's value is greater than the other
export function greaterThanValidator(
  controlName: string,
  comparingControlName: string,
  ignoreNulls = false
) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const group = formGroup as FormGroup;
    const control = group.controls[controlName];
    const comparingControl = group.controls[comparingControlName];

    if (control && comparingControl && control.value > comparingControl.value) {
      return null;
    }

    if (
      ignoreNulls &&
      ([null, 0].includes(control.value) ||
        [null, 0].includes(comparingControl.value))
    ) {
      return null;
    }

    return { greaterThan: controlName };
  };
}

// Custom validator to check if one control's value is smaller than the other
export function smallerThanValidator(
  controlName: string,
  comparingControlName: string,
  ignoreNulls = false
) {
  return (formGroup: AbstractControl): ValidationErrors | null => {
    const group = formGroup as FormGroup;
    const control = group.controls[controlName];
    const comparingControl = group.controls[comparingControlName];

    if (control && comparingControl && control.value < comparingControl.value) {
      return null;
    }

    if (
      ignoreNulls &&
      ([null, 0].includes(control.value) ||
        [null, 0].includes(comparingControl.value))
    ) {
      return null;
    }

    return { smallerThan: controlName };
  };
}
