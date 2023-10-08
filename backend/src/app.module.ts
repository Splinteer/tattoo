import {
  CacheInterceptor,
  CacheModule,
  MiddlewareConsumer,
  Module,
} from '@nestjs/common';
import { AuthModule } from './v1/auth/auth.module';
import { CustomerModule as CustomerModuleV1 } from './v1/customer/customer.module';
import { ShopModule as ShopModuleV1 } from './v1/shop/shop.module';
import { AuthMiddleware } from './v1/auth/auth.middleware';
import { FlashModule as FlashModuleV1 } from './v1/flash/flash.module';
import { GalleryModule as GalleryModuleV1 } from './v1/gallery/gallery.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BookingModule as BookingModuleV1 } from './v1/booking/booking.module';
import { ChatModule as ChatModuleV1 } from './v1/chat/chat.module';
import { ProjectModule as ProjectModuleV1 } from './v1/project/project.module';
import { AppointmentModule } from './v2/appointment/appointment.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { ProjectModule } from './v2/project/project.module';
import { FlashModule } from './v2/flash/flash.module';
import { ChatModule } from './v2/chat/chat.module';

const fiveMinutesInMs = 5 * 60 * 1000;

@Module({
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register({
      isGlobal: true,
      ttl: fiveMinutesInMs,
      max: 1000,
    }),
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
    CustomerModuleV1,
    ShopModuleV1,
    FlashModuleV1,
    ChatModuleV1,
    GalleryModuleV1,
    ProjectModuleV1,
    BookingModuleV1,

    AppointmentModule,
    FlashModule,
    ProjectModule,
    ChatModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
