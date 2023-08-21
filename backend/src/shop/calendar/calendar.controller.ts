import { Body, Controller, Get, Param, Query } from '@nestjs/common';
import { CalendarService } from './calendar.service';

@Controller('calendar')
export class CalendarController {
  constructor(private readonly calendarService: CalendarService) {}

  @Get(':shopUrl')
  async getEvents(
    @Param('shopUrl') shopUrl: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getEvents(shopUrl, startDate, endDate);
  }
}
