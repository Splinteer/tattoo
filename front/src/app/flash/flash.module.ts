import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopFlashAddComponent } from './shop-flash-add/shop-flash-add.component';
import { FlashItemComponent } from './flash-item/flash-item.component';
import { FlashService } from './flash.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { FlashDialogComponent } from './flash-dialog/flash-dialog.component';
import { DialogModule } from '@angular/cdk/dialog';
import { FlashEditComponent } from './flash-edit/flash-edit.component';
import { RouterModule } from '@angular/router';
import { InfiniteScrollModule } from 'ngx-infinite-scroll';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { FlashListComponent } from './flash-list/flash-list.component';

@NgModule({
  imports: [
    CommonModule,
    SharedModule,
    ReactiveFormsModule,
    DialogModule,
    RouterModule,
    InfiniteScrollModule,
    ScrollingModule,
  ],
  declarations: [
    ShopFlashAddComponent,
    FlashItemComponent,
    FlashDialogComponent,
    FlashEditComponent,
    FlashListComponent,
  ],
  providers: [FlashService],
  exports: [FlashItemComponent, FlashListComponent],
})
export class FlashModule {}
