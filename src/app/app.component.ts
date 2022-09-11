import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { Auth0Service } from './modules/auth/auth.service';
import { CredentialsService } from './modules/auth/credentials.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  title = 'tattoo';

  constructor(
    public auth0: Auth0Service,
    private credentials: CredentialsService,
    private router: Router
  ) {
    this.redirectToFirstStep();
  }

  private redirectToFirstStep() {
    if (!this.credentials.isAuthenticated()) {
      this.auth0.isAuthenticated.subscribe((isLoggedToAuth0) => {
        if (isLoggedToAuth0) {
          this.router.navigate(['/first-step'], {
            replaceUrl: true,
          });
        }
      });
    }
  }
}
