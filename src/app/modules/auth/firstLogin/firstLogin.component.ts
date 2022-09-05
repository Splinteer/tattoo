import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'src/app/cookie.service';
import { Auth0Service } from '../auth.service';
import { CredentialsService } from '../credentials.service';

@Component({
  selector: 'app-firstLogin',
  templateUrl: './firstLogin.component.html',
  styleUrls: ['./firstLogin.component.scss'],
})
export class FirstLoginComponent implements OnInit {
  public profileJson: string | null = null;

  private redirectUrl = '/';

  constructor(
    private route: ActivatedRoute,
    public auth0: Auth0Service,
    private cookie: CookieService,
    private credentialsService: CredentialsService,
    private router: Router
  ) {
    if (credentialsService.isAuthenticated()) {
      this.router.navigate(['/'], {
        replaceUrl: true,
      });
    }
  }

  ngOnInit(): void {
    this.auth0.user$.subscribe((profile) => {
      console.log(profile);
      this.profileJson = JSON.stringify(profile, null, 2);
      this.auth0.getToken.subscribe((token) => {
        this.cookie.set('token', token);
      });
    });

    this.route.queryParams.subscribe(({ redirect }) => {
      if (redirect) {
        this.redirectUrl = redirect;
      }
    });
  }

  public submit() {
    this.router.navigate([this.redirectUrl], {
      replaceUrl: true,
    });
  }
}
