import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { GalleryAddComponent } from './gallery-add/gallery-add.component';
import { GalleryRoutingModule } from './gallery-routing.module';
import { DialogModule } from '@angular/cdk/dialog';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { SharedModule } from '@app/shared/shared.module';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';
import { GalleryItemComponent } from './gallery-item/gallery-item.component';
import { GalleryDialogComponent } from './gallery-dialog/gallery-dialog.component';
import { GalleryService } from './gallery.service';

@NgModule({
  declarations: [
    GalleryAddComponent,
    GalleryEditComponent,
    GalleryListComponent,
    GalleryItemComponent,
    GalleryDialogComponent,
  ],
  imports: [
    CommonModule,
    GalleryRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    DialogModule,
    RouterModule,
    ScrollingModule,
  ],
  providers: [GalleryService],
  exports: [GalleryItemComponent],
})
export class GalleryModule {}
