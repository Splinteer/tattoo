import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { ChatEvent, EventService } from './event.service';
import { UUIDParam } from '@app/common/decorators/uuid-param.decorator';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ChatEventType } from './event.entity';
import { ProjectGuard } from '../project.guard';
@ApiTags('chat')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ProjectGuard)
@Controller({
  path: 'projects/:projectId/events',
  version: '2',
})
export class EventController {
  constructor(private readonly eventService: EventService) {}

  @ApiOkResponse({ description: 'Returns all events' })
  @Get()
  async getAll(
    @UUIDParam('projectId') projectId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date?: string,
  ) {
    return this.eventService.getAll(credentials.id, {
      projectId,
      date,
      shopId: credentials.shop_id,
    });
  }

  @ApiOkResponse({ description: 'Create a new event' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @Post()
  async create(
    @UUIDParam('projectId') projectId: string,
    @Credentials()
    credentials: ICredentials,
    @Body('content') content: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<ChatEvent[]> {
    const events: ChatEvent[] = [];

    if (files?.length) {
      const event = await this.eventService.create(
        projectId,
        credentials.id,
        ChatEventType.MEDIA,
      );
      try {
        await Promise.all(
          files.map((file) =>
            this.eventService.createMediaEvent(event.id, file),
          ),
        );

        const formattedChatEvent = await this.eventService.get(
          event.id,
          credentials.id,
        );
        events.push(formattedChatEvent);
        this.eventService.sendEvent(event.id).catch();
      } catch (error) {
        this.eventService.delete(event.id);

        throw error;
      }
    }

    if (content?.length) {
      const event = await this.eventService.create(
        projectId,
        credentials.id,
        ChatEventType.MESSAGE,
      );
      try {
        await this.eventService.createMessageEvent(event.id, content);
        const formattedChatEvent = await this.eventService.get(
          event.id,
          credentials.id,
        );

        this.eventService.sendEvent(event.id).catch();
        events.push(formattedChatEvent);
      } catch (error) {
        this.eventService.delete(event.id);

        throw error;
      }
    }

    return events;
  }
}
