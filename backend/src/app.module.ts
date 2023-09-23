import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AuthModule } from './v1/auth/auth.module';
import { CustomerModule } from './v1/customer/customer.module';
import { ShopModule } from './v1/shop/shop.module';
import { AuthMiddleware } from './v1/auth/auth.middleware';
import { FlashModule } from './v1/flash/flash.module';
import { GalleryModule } from './v1/gallery/gallery.module';
import { ScheduleModule } from '@nestjs/schedule';
import { BookingModule } from './v1/booking/booking.module';
import { ChatModule } from './v1/chat/chat.module';
import { ProjectModule } from './v1/project/project.module';
import { AppointmentModule } from './v2/appointment/appointment.module';

@Module({
  imports: [
    ScheduleModule.forRoot(),
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
    FlashModule,
    GalleryModule,
    BookingModule,
    ChatModule,
    ProjectModule,
    AppointmentModule,
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes('*');
  }
}
