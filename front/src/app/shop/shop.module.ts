import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ShopRoutingModule } from './shop-routing.module';
import { CreationComponent } from './creation/creation.component';
import { SharedModule } from '@app/shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ShopService } from './shop.service';
import { HomeComponent } from './home/home.component';
import { ShopEditComponent } from './shop-edit/shop-edit.component';
import { ShopGalleryComponent } from './shop-gallery/shop-gallery.component';
import { ShopGalleryAddComponent } from './shop-gallery-add/shop-gallery-add.component';
import { FlashModule } from '@app/flash/flash.module';
import { GalleryModule } from '@app/gallery/gallery.module';
import { ShopProfileComponent } from './shop-profile/shop-profile.component';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CalendarModule } from '@app/calendar/calendar.module';

@NgModule({
  imports: [
    CommonModule,
    ShopRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    FlashModule,
    GalleryModule,
    ScrollingModule,
    CalendarModule,
  ],
  declarations: [
    CreationComponent,
    HomeComponent,
    ShopEditComponent,
    ShopGalleryComponent,
    ShopGalleryAddComponent,
    ShopProfileComponent,
  ],
  providers: [ShopService],
})
export class ShopModule {}
