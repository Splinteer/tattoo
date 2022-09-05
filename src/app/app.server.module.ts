import { NgModule } from '@angular/core';
import {
  ServerModule,
  ServerTransferStateModule,
} from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { Auth0ServerService } from './modules/auth/auth.server.service';
import { Auth0Service } from './modules/auth/auth.service';

@NgModule({
  imports: [AppModule, ServerModule, ServerTransferStateModule],
  providers: [
    {
      provide: Auth0Service,
      useClass: Auth0ServerService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
