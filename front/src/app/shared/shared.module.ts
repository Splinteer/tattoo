import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from './ui/ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsiveComponent } from './responsive/responsive.component';
import { ResponsiveService } from './responsive/responsive.service';
import { GoBackDirective } from './go-back.directive';

@NgModule({
  declarations: [ResponsiveComponent, GoBackDirective],
  imports: [CommonModule, SharedUiModule],
  exports: [SharedUiModule, TranslateModule, GoBackDirective],
  providers: [ResponsiveService],
})
export class SharedModule {}
