import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { CreationComponent } from './creation/creation.component';
import { HomeComponent } from './home/home.component';
import { ShopEditComponent } from './shop-edit/shop-edit.component';
import { ShopGalleryComponent } from './shop-gallery/shop-gallery.component';
import { ShopFlashAddComponent } from '../flash/shop-flash-add/shop-flash-add.component';
import { FlashEditComponent } from '@app/flash/flash-edit/flash-edit.component';
import { FlashListComponent } from '@app/flash/flash-list/flash-list.component';
import { ShopGuard } from './shop.guard';
import { ShopProfileComponent } from './shop-profile/shop-profile.component';

const routes: Routes = [
  {
    path: '',
    canActivate: [ShopGuard],
    loadComponent: () =>
      import('./home/home.component').then((m) => m.HomeComponent),
  },
  {
    path: 'create',
    component: CreationComponent,
  },
  {
    path: 'edit',
    canActivate: [ShopGuard],
    component: ShopEditComponent,
  },
  {
    path: 'disponiblite',
    canActivate: [ShopGuard],
    loadComponent: () =>
      import('./availability/availability.component').then(
        (m) => m.AvailabilityComponent
      ),
  },
  {
    path: 'gallery',
    canActivate: [ShopGuard],
    component: ShopGalleryComponent,
  },
  {
    path: 'gallery/flash/add',
    canActivate: [ShopGuard],
    component: ShopFlashAddComponent,
  },

  {
    path: 'gallery/flash/all',
    canActivate: [ShopGuard],
    component: FlashListComponent,
  },

  {
    path: 'gallery/flash/:id',
    canActivate: [ShopGuard],
    component: FlashEditComponent,
  },

  {
    path: 'gallery',
    canActivate: [ShopGuard],
    loadChildren: () =>
      import('../gallery/gallery.module').then((m) => m.GalleryModule),
  },
  {
    path: ':shopUrl',
    component: ShopProfileComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ShopRoutingModule {}
