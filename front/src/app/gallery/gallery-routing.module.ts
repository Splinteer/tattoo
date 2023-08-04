import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GalleryAddComponent } from './gallery-add/gallery-add.component';
import { GalleryEditComponent } from './gallery-edit/gallery-edit.component';
import { GalleryListComponent } from './gallery-list/gallery-list.component';

const routes: Routes = [
  {
    path: 'add',
    component: GalleryAddComponent,
  },

  { path: 'all', component: GalleryListComponent },

  {
    path: ':id',
    component: GalleryEditComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class GalleryRoutingModule {}
