import { Directive, HostListener } from '@angular/core';
import { Location } from '@angular/common';

@Directive({
  selector: '[appGoBack]',
})
export class GoBackDirective {
  constructor(private readonly location: Location) {}

  @HostListener('click')
  onClick() {
    this.location.back();
  }
}
