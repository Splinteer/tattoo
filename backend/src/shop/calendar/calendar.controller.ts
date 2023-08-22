import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { CalendarEvent, CalendarService, EventType } from './calendar.service';
import {
  Availability,
  LinkedDateRange,
} from '../availability/availability.service';
import { ShopService } from '../shop.service';

@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly shopService: ShopService,
  ) {}

  @Get(':shopUrl')
  async getEvents(
    @Param('shopUrl') shopUrl: string,
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
  ) {
    return this.calendarService.getEvents(shopUrl, startDate, endDate);
  }

  @Post(':type/add')
  async addEvent(
    @Param('type') type: EventType,
    @Body() body: Omit<CalendarEvent, 'id'>,
  ) {
    const shop = await this.shopService.getByUrl(body.shop_url);

    if (type === 'Availability') {
      return this.calendarService.addAvailability(shop.id, body);
    }
    if (type === 'Unavailability') {
      return this.calendarService.addUnavailability(shop.id, body);
    }
  }

  @Post(':type/update')
  async updateEvent(
    @Param('type') type: EventType,
    @Body() body: CalendarEvent,
  ) {
    if (type === 'Availability') {
      return this.calendarService.updateAvailability(body);
    }
    if (type === 'Unavailability') {
      return this.calendarService.updateUnavailability(body);
    }
  }

  @Delete(':type/:id')
  async deleteEvent(@Param('type') type: EventType, @Param('id') id: string) {
    if (type === 'Availability') {
      return this.calendarService.deleteAvailability(id);
    }
    if (type === 'Unavailability') {
      return this.calendarService.deleteUnavailability(id);
    }
  }
}
