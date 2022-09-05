import { Auth0Service } from './auth.service';
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CredentialsService } from './credentials.service';

@Injectable({
  providedIn: 'root',
})
export class CompleteAuthenticationGuard implements CanActivate {
  constructor(
    private auth0: Auth0Service,
    private credentialsService: CredentialsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): boolean {
    if (this.credentialsService.isAuthenticated()) {
      return true;
    }

    this.auth0.isAuthenticated.subscribe((registred) => {
      const redirectUrl = registred ? '/first-step' : '/';

      this.router.navigate([redirectUrl], {
        queryParams: { redirect: state.url },
        replaceUrl: true,
      });
    });

    return false;
  }
}
