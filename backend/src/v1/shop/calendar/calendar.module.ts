import { Module } from '@nestjs/common';
import { CalendarController } from './calendar.controller';
import { CalendarService } from './calendar.service';
import { CommonModule } from '@app/common';
import { ShopService } from '../shop.service';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { HttpModule } from '@nestjs/axios';
import { ChatModule } from 'src/v1/chat/chat.module';
import { AppointmentController } from './appointment/appointment.controller';
import { AppointmentService } from './appointment/appointment.service';

@Module({
  imports: [CommonModule, HttpModule, ChatModule],
  controllers: [CalendarController, AppointmentController],
  providers: [
    CalendarService,
    ShopService,
    GoogleCalendarService,
    AppointmentService,
  ],
})
export class CalendarModule {}
