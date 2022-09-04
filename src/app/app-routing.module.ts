import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { LoginComponent } from './auth/login/login.component';

import { AuthGuard as Auth0Guard } from '@auth0/auth0-angular';
import { FirstLoginComponent } from './auth/firstLogin/firstLogin.component';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'first-step',
    component: FirstLoginComponent,
    // canActivate: [Auth0Guard],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      initialNavigation: 'enabled',
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
