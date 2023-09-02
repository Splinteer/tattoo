import { Module } from '@nestjs/common';
import { BookingController } from './booking.controller';
import { BookingService } from './booking.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';
import { ShopModule } from 'src/shop/shop.module';
import { CustomerModule } from 'src/customer/customer.module';

@Module({
  imports: [CommonModule, AuthModule, ShopModule, CustomerModule],
  controllers: [BookingController],
  providers: [BookingService],
})
export class BookingModule {}
