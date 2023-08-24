import { CdkStepper } from '@angular/cdk/stepper';
import { Component, ContentChild, TemplateRef } from '@angular/core';
import { AbstractControl } from '@angular/forms';

@Component({
  selector: 'app-form-stepper',
  templateUrl: './form-stepper.component.html',
  styleUrls: ['./form-stepper.component.scss'],
  providers: [{ provide: CdkStepper, useExisting: FormStepperComponent }],
})
export class FormStepperComponent extends CdkStepper {
  @ContentChild('headers') headers: TemplateRef<any> | undefined;

  @ContentChild('submit') submitRef: TemplateRef<any> | undefined;

  onClick(index: number, stepControl?: { valid: boolean }): void {
    if (!stepControl || stepControl.valid) {
      this.selectedIndex = index;
    }
  }
}
