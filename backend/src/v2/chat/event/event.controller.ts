import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { EventService } from './event.service';
import { UUIDParam } from '@app/common/decorators/uuid-param.decorator';
import { ChatGuard } from '../chat.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ChatGuard)
@Controller({
  path: 'chats/:chatId/events',
  version: '2',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOkResponse({ description: 'Returns all appointments' })
  @Get()
  getAll(
    @UUIDParam('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date?: string,
  ) {
    return this.eventService.getAll(
      chatId,
      date,
      credentials.id,
      credentials.shop_id,
    );
  }
}
