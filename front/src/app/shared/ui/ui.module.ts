import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HamburgerComponent } from './hamburger/hamburger.component';

@NgModule({
  declarations: [HamburgerComponent],
  exports: [HamburgerComponent],
  imports: [CommonModule],
})
export class SharedUiModule {}
