import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WaveSeparatorComponent } from './waveSeparator/waveSeparator.component';

@NgModule({
  imports: [CommonModule],
  declarations: [WaveSeparatorComponent],
  exports: [WaveSeparatorComponent],
})
export class SharedModule {}
