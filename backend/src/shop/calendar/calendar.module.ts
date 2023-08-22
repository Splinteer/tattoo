import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CommonModule } from '@app/common';
import { ShopService } from '../shop.service';

@Module({
  imports: [CommonModule],
  controllers: [CalendarController],
  providers: [CalendarService, ShopService],
})
export class CalendarModule {}
