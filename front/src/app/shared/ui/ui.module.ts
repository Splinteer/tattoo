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

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  declarations: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
    ToggleGroupComponent,
    ToggleGroupItemComponent,
    InputNumberComponent,
  ],
  exports: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
    ToggleGroupComponent,
    ToggleGroupItemComponent,
    InputNumberComponent,
  ],
})
export class SharedUiModule {}
