import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreationComponent } from './creation/creation.component';
import { HomeComponent } from './home/home.component';
import { ShopEditComponent } from './shop-edit/shop-edit.component';
import { ShopGalleryComponent } from './shop-gallery/shop-gallery.component';
import { ShopGalleryAddComponent } from './shop-gallery-add/shop-gallery-add.component';
import { ShopFlashAddComponent } from '../flash/shop-flash-add/shop-flash-add.component';
import { FlashEditComponent } from '@app/flash/flash-edit/flash-edit.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'create',
    component: CreationComponent,
  },
  {
    path: 'edit',
    component: ShopEditComponent,
  },
  {
    path: 'gallery',
    component: ShopGalleryComponent,
  },
  {
    path: 'gallery/flash/add',
    component: ShopFlashAddComponent,
  },

  {
    path: 'gallery/flash/:id',
    component: FlashEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
