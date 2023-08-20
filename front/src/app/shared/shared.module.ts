import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SharedUiModule } from './ui/ui.module';
import { TranslateModule } from '@ngx-translate/core';
import { ResponsiveComponent } from './responsive/responsive.component';
import { ResponsiveService } from './responsive/responsive.service';
import { GoBackDirective } from './go-back.directive';
import { TimeAgoPipe } from './timeAgo.pipe';
import { AvatarComponent } from './avatar/avatar.component';
import { FormStepperComponent } from './form-stepper/form-stepper.component';
import { ToggleComponent } from './toggle/toggle.component';
import { IconSelectComponent } from './icon-select/icon-select.component';
import { FormsModule } from '@angular/forms';

@NgModule({
  declarations: [
    ResponsiveComponent,
    GoBackDirective,
    TimeAgoPipe,
    FormStepperComponent,
    IconSelectComponent,
  ],
  imports: [
    CommonModule,
    SharedUiModule,
    FormsModule,
    AvatarComponent,
    ToggleComponent,
  ],
  exports: [
    SharedUiModule,
    TranslateModule,
    GoBackDirective,
    TimeAgoPipe,
    AvatarComponent,
    FormStepperComponent,
    IconSelectComponent,
    ToggleComponent,
  ],
  providers: [ResponsiveService],
})
export class SharedModule {}
