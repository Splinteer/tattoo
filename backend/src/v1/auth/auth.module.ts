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
import { SessionService } from './session/session.service';
import { CredentialsService } from './credentials/credentials.service';
import { AuthController } from './auth.controller';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule],
  providers: [SessionService, CredentialsService],
  exports: [SessionService, CredentialsService],
  controllers: [AuthController],
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
      imports: [HttpModule],
      module: AuthModule,
    };
  }
}
