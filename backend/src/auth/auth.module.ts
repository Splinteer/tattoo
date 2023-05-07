import {
  MiddlewareConsumer,
  Module,
  NestModule,
  DynamicModule,
} from '@nestjs/common';

import { AuthMiddleware } from './auth.middleware';
import { ConfigInjectionToken, AuthModuleConfig } from './config.interface';
import { SupertokensService } from './supertokens/supertokens.service';
import { HttpModule } from '@nestjs/axios';
import { CustomerModule } from 'src/customer/customer.module';
import { SessionService } from './session/session.service';

@Module({
  imports: [CustomerModule],
  providers: [SessionService],
  exports: [SessionService],
  controllers: [],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }

  static forRoot({
    connectionURI,
    apiKey,
    appInfo,
  }: AuthModuleConfig): DynamicModule {
    return {
      providers: [
        {
          useValue: {
            appInfo,
            connectionURI,
            apiKey,
          },
          provide: ConfigInjectionToken,
        },
        SupertokensService,
        SessionService,
      ],
      exports: [],
      imports: [HttpModule, CustomerModule],
      module: AuthModule,
    };
  }
}
