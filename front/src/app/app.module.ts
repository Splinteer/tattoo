import { DEFAULT_CURRENCY_CODE, LOCALE_ID, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { registerLocaleData } from '@angular/common';
import localeFr from '@angular/common/locales/fr';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { CoreModule } from '@core/http/core.module';
import { AuthModule } from './auth/auth.module';
import { HeaderComponent } from './header/header.component';
import { CdkMenuModule } from '@angular/cdk/menu';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { SharedModule } from './shared/shared.module';
import {
  TranslateCompiler,
  TranslateLoader,
  TranslateModule,
} from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { TranslateMessageFormatCompiler } from 'ngx-translate-messageformat-compiler';
import { ShopModule } from './shop/shop.module';
import { MobileNavigationComponent } from './mobile-navigation/mobile-navigation.component';
import { FlashModule } from './flash/flash.module';

// required for AOT compilation
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
  return new TranslateHttpLoader(http);
}

registerLocaleData(localeFr);
@NgModule({
  imports: [
    // Angular modules
    BrowserModule,
    CoreModule,
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,

    // Third party modules
    CdkMenuModule,
    TranslateModule.forRoot({
      defaultLanguage: 'fr',
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient],
      },
      compiler: {
        provide: TranslateCompiler,
        useClass: TranslateMessageFormatCompiler,
      },
    }),

    // App modules
    AuthModule,
    ShopModule,
    SharedModule,
    FlashModule,
  ],
  declarations: [
    AppComponent,
    HomeComponent,
    HeaderComponent,
    MobileNavigationComponent,
  ],
  providers: [
    { provide: LOCALE_ID, useValue: 'fr' },
    { provide: DEFAULT_CURRENCY_CODE, useValue: 'EUR' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
