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
    if (isRequired) {
      errors['input-condition'] = conditionerControlPath.join('.');
    } else {
      delete errors['input-condition'];
    }

    targetControl?.setErrors(Object.keys(errors).length ? errors : null);

    return null;
  };
}
