import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CommonModule } from '@app/common';
import { ShopService } from '../shop.service';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { HttpModule } from '@nestjs/axios';

@Module({
  imports: [CommonModule, HttpModule],
  controllers: [CalendarController],
  providers: [CalendarService, ShopService, GoogleCalendarService],
})
export class CalendarModule {}
