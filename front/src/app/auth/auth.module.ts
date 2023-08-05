import { APP_INITIALIZER, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';
import { AuthComponent } from './auth.component';
import { SupertokensService } from './supertokens.service';
import { CredentialsService } from './credentials.service';

export function initializeSupertokens(
  supertokensService: SupertokensService
): () => Promise<void> {
  return () => supertokensService.initializeApp();
}

@NgModule({
  declarations: [AuthComponent],
  imports: [CommonModule, AuthRoutingModule],
  providers: [
    CredentialsService,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeSupertokens,
      multi: true,
      deps: [SupertokensService],
    },
  ],
})
export class AuthModule {}
