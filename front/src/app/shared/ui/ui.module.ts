import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HamburgerComponent } from './hamburger/hamburger.component';
import { IconInputComponent } from './icon-input/icon-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UrlInputComponent } from './url-input/url-input.component';
import { FileDropzoneComponent } from './file-dropzone/file-dropzone.component';
import { TranslateModule } from '@ngx-translate/core';
import { ToggleGroupComponent } from '../toggle-group/toggle-group.component';
import { ToggleGroupItemComponent } from './toggleGroup/toggle-group-item/toggle-group-item.component';
import { InputNumberComponent } from './input-number/input-number.component';
import { ConfirmDialogComponent } from './confirm-dialog/confirm-dialog.component';
import { ConfirmService } from './confirm.service';

@NgModule({
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    TranslateModule,
    ToggleGroupComponent,
    ToggleGroupItemComponent,
  ],
  declarations: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
    InputNumberComponent,
    ConfirmDialogComponent,
  ],
  exports: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
    ToggleGroupComponent,
    ToggleGroupItemComponent,
    InputNumberComponent,
    ConfirmDialogComponent,
  ],
  providers: [ConfirmService],
})
export class SharedUiModule {}
