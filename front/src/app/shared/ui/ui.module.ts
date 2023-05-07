import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HamburgerComponent } from './hamburger/hamburger.component';
import { IconInputComponent } from './icon-input/icon-input.component';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { UrlInputComponent } from './url-input/url-input.component';
import { FileDropzoneComponent } from './file-dropzone/file-dropzone.component';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [CommonModule, ReactiveFormsModule, FormsModule, TranslateModule],
  declarations: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
  ],
  exports: [
    HamburgerComponent,
    IconInputComponent,
    UrlInputComponent,
    FileDropzoneComponent,
  ],
})
export class SharedUiModule {}
