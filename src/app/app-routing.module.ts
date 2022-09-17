import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { Auth0Guard } from './modules/auth/auth0.guard';
import { CompleteAuthenticationGuard } from './modules/auth/completeAuth.guard';

const routes: Routes = [
  // {
  //   path: 'first-step',
  //   component: FirstLoginComponent,
  //   canActivate: [Auth0Guard],
  // },
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
