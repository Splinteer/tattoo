import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CustomerModule } from './customer/customer.module';
import { ShopModule } from './shop/shop.module';
import { AuthMiddleware } from './auth/auth.middleware';

@Module({
  imports: [
    AuthModule.forRoot({
      connectionURI: 'http://localhost:3567',
      // apiKey: <API_KEY(if configured)>,
      appInfo: {
        // Learn more about this on https://supertokens.com/docs/thirdparty/appinfo
        appName: 'app',
        apiDomain: 'http://localhost:3000',
        websiteDomain: 'http://localhost:4200',
        apiBasePath: '/auth',
        websiteBasePath: '/auth',
      },
    }),
    CustomerModule,
    ShopModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
