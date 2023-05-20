import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ShopFlashAddComponent } from './shop-flash-add/shop-flash-add.component';
import { FlashItemComponent } from './flash-item/flash-item.component';
import { FlashService } from './flash.service';
import { ReactiveFormsModule } from '@angular/forms';
import { SharedModule } from '@shared/shared.module';
import { FlashDialogComponent } from './flash-dialog/flash-dialog.component';
import { DialogModule } from '@angular/cdk/dialog';

@NgModule({
  imports: [CommonModule, SharedModule, ReactiveFormsModule, DialogModule],
  declarations: [
    ShopFlashAddComponent,
    FlashItemComponent,
    FlashDialogComponent,
  ],
  providers: [FlashService],
  exports: [FlashItemComponent],
})
export class FlashModule {}
