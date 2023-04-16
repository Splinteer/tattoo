import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from './ui/ui.module';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedUiModule],
  exports: [SharedUiModule],
})
export class SharedModule {}
