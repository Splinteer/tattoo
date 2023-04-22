import { Injectable } from '@angular/core';

import * as SuperTokens from 'supertokens-auth-react';
import * as ThirdPartyEmailPassword from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import {
  Github,
  Google,
  Facebook,
  Apple,
} from 'supertokens-auth-react/recipe/thirdpartyemailpassword';
import Session from 'supertokens-auth-react/recipe/session';
import { CredentialsService } from './credentials.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SupertokensService {
  constructor(private readonly credentialsService: CredentialsService) {
    this.init();
    this.checkSession();

    this.credentialsService.refreshCredentials$.pipe(
      tap(() => this.checkSession())
    ).subscribe;
  }

  private init(): void {
    SuperTokens.init({
      appInfo: {
        appName: 'app',
        apiDomain: 'http://localhost:3000',
        websiteDomain: 'http://localhost:4200',
        apiBasePath: '/auth',
        websiteBasePath: '/auth',
      },
      recipeList: [
        ThirdPartyEmailPassword.init({
          signInAndUpFeature: {
            providers: [Google.init(), Facebook.init()],
          },
          onHandleEvent: async (context) => {
            if (context.action === 'SUCCESS') {
              let { id, email } = context.user;

              this.checkSession();
            }
          },
        }),
        Session.init(),
      ],
    });
  }

  private async checkSession() {
    const sessionExists = await Session.doesSessionExist();
    if (sessionExists) {
      const res = await Session.getAccessTokenPayloadSecurely();
      let customer = res.customer;

      while (!customer) {
        await Session.attemptRefreshingSession();
        const res = await Session.getAccessTokenPayloadSecurely();
        customer = res.customer;
        await new Promise((resolve) => setTimeout(resolve, 500));
      }

      this.credentialsService.credentialsSubject$.next(customer);
    }
  }
}
