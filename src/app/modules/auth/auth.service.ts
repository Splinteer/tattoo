import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '@auth0/auth0-angular';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class Auth0Service {
  isAuthenticated: Observable<boolean>;
  user$: Observable<User | null | undefined>;
  getToken: Observable<string>;

  constructor(private auth: AuthService) {
    this.isAuthenticated = this.auth.isAuthenticated$;
    this.user$ = this.auth.user$;
    this.getToken = this.auth.getAccessTokenSilently();
  }

  login() {
    this.auth.loginWithRedirect({
      redirect_uri: environment.appUrl + '/first-step',
    });
  }

  logout() {
    this.auth.logout();
  }

  signup() {
    this.auth.loginWithRedirect({
      screen_hint: 'signup',
      redirect_uri: environment.appUrl + '/first-step',
    });
  }
}
