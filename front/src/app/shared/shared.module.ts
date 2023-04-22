import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from './ui/ui.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  declarations: [],
  imports: [CommonModule, SharedUiModule],
  exports: [SharedUiModule, TranslateModule],
})
export class SharedModule {}
