import { NgModule } from '@angular/core';
import { ServerModule } from '@angular/platform-server';

import { AppModule } from './app.module';
import { AppComponent } from './app.component';

import { Auth0ServerService } from './auth/auth.server.service';
import { Auth0Service } from './auth/auth.service';

@NgModule({
  imports: [AppModule, ServerModule],
  providers: [
    {
      provide: Auth0Service,
      useClass: Auth0ServerService,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppServerModule {}
