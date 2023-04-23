import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from './ui/ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsiveComponent } from './responsive/responsive.component';
import { ResponsiveService } from './responsive/responsive.service';

@NgModule({
  declarations: [ResponsiveComponent],
  imports: [CommonModule, SharedUiModule],
  exports: [SharedUiModule, TranslateModule],
  providers: [ResponsiveService],
})
export class SharedModule {}
