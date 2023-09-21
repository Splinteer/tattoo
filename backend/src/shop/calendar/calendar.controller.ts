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
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { DateTime } from 'luxon';
import { Cron, CronExpression } from '@nestjs/schedule';

// TODO Auth
@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly calendarService: CalendarService,
    private readonly shopService: ShopService,
    private readonly googleCalendar: GoogleCalendarService,
  ) {}

  @Get(':shopUrl/min-availability-date')
  async getMinimumDateAvailability(@Param('shopUrl') shopUrl: string) {
    return this.calendarService.getMinimumDateAvailability(shopUrl);
  }

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

    let event: (Availability & LinkedDateRange) | LinkedDateRange;
    if (type === 'Availability') {
      event = await this.calendarService.addAvailability(shop.id, body);
    }
    if (type === 'Unavailability') {
      event = await this.calendarService.addUnavailability(shop.id, body);
    }

    const { start, end } = this.googleCalendar.getStartAndEnd(
      event.start_date_time,
      event.end_date_time,
    );

    this.googleCalendar
      .createEventWithName(type, {
        id: event.id.replaceAll('-', ''),
        start,
        end,
        summary: type,
      })
      .subscribe();

    return event;
  }

  @Post(':type/update')
  async updateEvent(
    @Param('type') type: EventType,
    @Body() body: CalendarEvent,
  ) {
    let event: (Availability & LinkedDateRange) | LinkedDateRange;
    if (type === 'Availability') {
      event = await this.calendarService.updateAvailability(body);
    }
    if (type === 'Unavailability') {
      event = await this.calendarService.updateUnavailability(body);
    }

    const { start, end } = this.googleCalendar.getStartAndEnd(
      event.start_date_time,
      event.end_date_time,
    );

    const calendarId = this.googleCalendar.getCalendarId(type);

    this.googleCalendar
      .updateEvent(calendarId, event.id.replaceAll('-', ''), {
        start,
        end,
        summary: type,
      })
      .subscribe();

    return event;
  }

  @Delete(':type/:id')
  async deleteEvent(@Param('type') type: EventType, @Param('id') id: string) {
    let event: (Availability & LinkedDateRange) | LinkedDateRange;
    if (type === 'Availability') {
      event = await this.calendarService.deleteAvailability(id);
    }
    if (type === 'Unavailability') {
      event = await this.calendarService.deleteUnavailability(id);
    }

    const calendarId = this.googleCalendar.getCalendarId(type);

    this.googleCalendar
      .deleteEvent(calendarId, event.id.replaceAll('-', ''))
      .subscribe();
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async deletePastAppointments() {
    await this.calendarService.deletePastUnconfirmedAppointments();
    await this.calendarService.deletePastAvailability();
  }
}
