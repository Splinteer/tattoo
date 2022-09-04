import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthService, User } from '@auth0/auth0-angular';

@Injectable({
  providedIn: 'root',
})
export class Auth0Service {
  isAuthenticated: any;
  user$: Observable<User | null | undefined>;
  getToken: any;

  constructor(private auth: AuthService) {
    this.isAuthenticated = this.auth.isAuthenticated$;
    this.user$ = this.auth.user$;
    this.getToken = this.auth.getAccessTokenSilently();
  }

  login() {
    this.auth.loginWithRedirect();
  }

  logout() {
    this.auth.logout();
  }

  signup() {
    this.auth.loginWithRedirect({ screen_hint: 'signup' });
  }
}
