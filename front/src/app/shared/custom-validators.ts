import {
  FormGroup,
  ValidatorFn,
  AbstractControl,
  ValidationErrors,
  Validators,
} from '@angular/forms';

export const noSpaceNoSpecialCharactersValidator =
  Validators.pattern('^[a-zA-Z0-9_-]*$');

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

export function inputConditionalRequiredValidator(
  conditionerControlPath: (string | number)[],
  targetControlPath: (string | number)[],
  comparator: any | ((targetControlValue: any) => boolean)
): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const conditionerControl = form.get(conditionerControlPath);
    const targetControl = form.get(targetControlPath);

    const conditionerValue = conditionerControl?.value;

    const isRequired =
      typeof comparator === 'function'
        ? comparator(conditionerValue)
        : conditionerValue === comparator;

    const errors = targetControl?.errors || {};
    if (isRequired && targetControl?.value.length === 0) {
      errors['required'] = conditionerControlPath.join('.');
    } else {
      delete errors['required'];
    }

    targetControl?.setErrors(Object.keys(errors).length ? errors : null);

    return null;
  };
}

export function minDateValidator(minDate: Date): ValidatorFn {
  minDate.setHours(0);
  minDate.setMinutes(0);
  minDate.setSeconds(0);
  minDate.setMilliseconds(0);

  return (control: AbstractControl): ValidationErrors | null => {
    const controlDate = new Date(control.value);
    controlDate.setHours(0);
    controlDate.setMinutes(0);
    controlDate.setSeconds(0);
    controlDate.setMilliseconds(0);

    if (controlDate < minDate) {
      return { minDate: { value: control.value } };
    }

    return null;
  };
}

export function dateRangeValidator(
  startControl: string | string[],
  endControl: string | string[]
): ValidatorFn {
  return (form: AbstractControl): ValidationErrors | null => {
    const startDate = new Date(form.get(startControl)?.value);
    const endDate = new Date(form.get(endControl)?.value);

    if (endDate < startDate) {
      return { dateRange: true };
    }

    return null;
  };
}
