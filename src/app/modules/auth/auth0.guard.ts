import { Auth0Service } from './auth.service';
import { Injectable } from '@angular/core';
import {
  Router,
  CanActivate,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
} from '@angular/router';
import { CredentialsService } from './credentials.service';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth0Guard implements CanActivate {
  constructor(
    private auth0: Auth0Service,
    private credentialsService: CredentialsService,
    private router: Router
  ) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean> {
    return this.auth0.isAuthenticated.pipe(
      map((registred) => {
        if (!registred) {
          this.router.navigate(['/'], {
            queryParams: { redirect: state.url },
            replaceUrl: true,
          });
        }
        return registred;
      })
    );
  }
}
