import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import { CalendarEvent, CalendarService, EventType } from './calendar.service';
import {
  Availability,
  LinkedDateRange,
} from '../availability/availability.service';
import { ShopService } from '../shop.service';
import { GoogleCalendarService } from './google-calendar/google-calendar.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import {
  ChatEventService,
  ChatEventType,
} from 'src/v1/chat/chat-event/chat-event.service';
import { ChatService } from 'src/v1/chat/chat.service';

// TODO Auth
@Controller('calendar')
export class CalendarController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatEventService: ChatEventService,
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

  @Post('proposal')
  @UseGuards(new AuthGuard())
  async addProposal(
    @Credentials()
    credentials: ICredentials,
    @Body()
    body: {
      start_time: string;
      end_time: string;
      projectId: string;
    },
  ) {
    const { id: chatId } = await this.chatService.getChatByProject(
      body.projectId,
    );

    if (!chatId) {
      throw new BadRequestException();
    }

    const canAccess = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );

    if (!canAccess) {
      throw new ForbiddenException();
    }

    const proposal = await this.calendarService.addProposal(
      credentials.shop_url,
      body.projectId,
      body.start_time,
      body.end_time,
    );

    const event = await this.chatEventService.addEvent(
      chatId,
      credentials.id,
      ChatEventType.appointment_new,
      proposal.id,
    );

    this.chatEventService.sendEventToUser(event.id).catch(console.error);

    return { proposal, event: { ...event, is_sender: true } };
  }

  @Post(':type/add')
  async addEvent(
    @Param('type') type: EventType,
    @Body() body: Omit<CalendarEvent, 'id'>,
  ): Promise<LinkedDateRange | (Availability & LinkedDateRange)> {
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
