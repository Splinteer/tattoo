import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopRoutingModule } from './shop-routing.module';
import { CreationComponent } from './creation/creation.component';
import { SharedModule } from '@app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  imports: [CommonModule, ShopRoutingModule, SharedModule, ReactiveFormsModule],
  declarations: [CreationComponent],
})
export class ShopModule {}
