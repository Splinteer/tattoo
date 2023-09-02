import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';
import { AvailabilityModule } from './availability/availability.module';
import { CalendarModule } from './calendar/calendar.module';

@Module({
  imports: [CommonModule, AuthModule, AvailabilityModule, CalendarModule],
  controllers: [ShopController],
  providers: [ShopService],
  exports: [ShopService],
})
export class ShopModule {}
