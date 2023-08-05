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
import * as EmailVerification from 'supertokens-auth-react/recipe/emailverification';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Injectable({
  providedIn: 'root',
})
export class SupertokensService {
  constructor(private readonly credentialsService: CredentialsService) {
    this.credentialsService.refreshCredentials$
      .pipe(
        tap(async () => {
          await Session.attemptRefreshingSession();
          this.checkSession();
        }),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  public async initializeApp(): Promise<void> {
    this.init();
    await this.checkSession();
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
        EmailVerification.init({ mode: 'REQUIRED' }),
        Session.init(),
      ],
    });
  }

  private async checkSession() {
    const sessionExists = await Session.doesSessionExist();
    if (sessionExists) {
      let credentials;
      let attempt = 0;

      while (!credentials && attempt++ <= 5) {
        await Session.attemptRefreshingSession();
        const res = await Session.getAccessTokenPayloadSecurely();
        const verified = this.checkVerified(res);

        if (verified) {
          credentials = res.credentials;
        }
        if (!credentials) {
          await new Promise((resolve) => setTimeout(resolve, 500));
        }
      }

      if (!credentials) {
        this.credentialsService.logOut();
        return;
      }

      this.credentialsService.credentialsSubject$.next(credentials);
    }
  }

  private checkVerified(
    token: Partial<{ 'st-ev': { v: boolean; t: number } }>
  ) {
    return token['st-ev']?.v;
  }
}
