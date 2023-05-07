import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopRoutingModule } from './shop-routing.module';
import { CreationComponent } from './creation/creation.component';
import { SharedModule } from '@app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ShopService } from './shop.service';

@NgModule({
  imports: [CommonModule, ShopRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [CreationComponent],
  providers: [ShopService],
})
export class ShopModule {}
