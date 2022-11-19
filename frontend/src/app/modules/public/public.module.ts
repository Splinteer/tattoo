import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HomeComponent } from './home/home.component';
import { SharedModule } from '../shared/shared.module';
import { ShopModule } from '@modules/shop/shop.module';

@NgModule({
  imports: [CommonModule, SharedModule, ShopModule],
  declarations: [HomeComponent],
})
export class PublicModule {}
