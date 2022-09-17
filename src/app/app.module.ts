import { NgModule } from '@angular/core';
import {
  BrowserModule,
  BrowserTransferStateModule,
} from '@angular/platform-browser';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthHttpInterceptor } from '@auth0/auth0-angular';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';

import { AuthModule as Auth0Module } from '@auth0/auth0-angular';
import { AuthModule } from './modules/auth/auth.module';
import { environment } from 'src/environments/environment';
import { ApiInterceptor } from './api.interceptor';
import { HeaderModule } from './modules/header/header.module';

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserTransferStateModule,
    AppRoutingModule,
    HttpClientModule,
    Auth0Module.forRoot({
      domain: environment.auth0.domain,
      clientId: environment.auth0.clientId,
      audience: 'https://' + environment.auth0.domain + '/api/v2/',
      scope: 'read:client_grants',
      httpInterceptor: {
        allowedList: [
          {
            uri: environment.apiUrl + '/*',
            tokenOptions: {
              audience: 'https://' + environment.auth0.domain + '/api/v2/',
              scope: 'read:client_grants',
            },
          },
        ],
      },
    }),
    NgbModule,
    AuthModule,
    HeaderModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ApiInterceptor,
      multi: true,
    },
    { provide: HTTP_INTERCEPTORS, useClass: AuthHttpInterceptor, multi: true },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
