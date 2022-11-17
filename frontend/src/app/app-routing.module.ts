import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Auth0Guard } from './modules/auth/auth0.guard';
import { CompleteAuthenticationGuard } from './modules/auth/completeAuth.guard';
import { HomeComponent } from './modules/public/home/home.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'first-step',
    component: HomeComponent,
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabledBlocking',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
