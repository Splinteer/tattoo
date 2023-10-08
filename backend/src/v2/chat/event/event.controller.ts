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
import { ChatGuard } from '../chat.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { FilesInterceptor } from '@nestjs/platform-express';
import { DataSource } from 'typeorm';
import { ChatEventSchema, ChatEventType } from './event.entity';
import {
  ChatEventMediaSchema,
  ChatEventMessageSchema,
} from './entity/event-types.entity';

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ChatGuard)
@Controller({
  path: 'chats/:chatId/events',
  version: '2',
})
export class EventController {
  constructor(
    private dataSource: DataSource,
    private readonly eventService: EventService,
  ) {}

  @ApiOkResponse({ description: 'Returns all events' })
  @Get()
  async getAll(
    @UUIDParam('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date?: string,
  ) {
    return this.eventService.getAll(credentials.id, {
      chatId,
      date,
      shopId: credentials.shop_id,
    });
  }

  @ApiOkResponse({ description: 'Create a new event' })
  @UseInterceptors(FilesInterceptor('attachments'))
  @Post()
  async create(
    @UUIDParam('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Body('content') content: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const chatEventRepository =
        await queryRunner.manager.getRepository<ChatEventSchema>('chat_event');

      let mediaEvent: ChatEventSchema;
      let messageEvent: ChatEventSchema;

      if (content?.length) {
        const chatEventMessageRepository =
          await queryRunner.manager.getRepository<ChatEventMessageSchema>(
            'chat_event_message',
          );

        messageEvent = await this.eventService.create(
          chatEventRepository,
          chatId,
          credentials.id,
          ChatEventType.MESSAGE,
        );
        await this.eventService.createMessageEvent(
          chatEventMessageRepository,
          messageEvent.id,
          content,
        );
      }

      if (files.length) {
        const chatEventMediaRepository =
          await queryRunner.manager.getRepository<ChatEventMediaSchema>(
            'chat_event_media',
          );

        mediaEvent = await this.eventService.create(
          chatEventRepository,
          chatId,
          credentials.id,
          ChatEventType.MEDIA,
        );

        await Promise.all(
          files.map((file) =>
            this.eventService.createMediaEvent(
              chatEventMediaRepository,
              mediaEvent.id,
              file,
            ),
          ),
        );
      }

      await queryRunner.commitTransaction();

      const events: ChatEvent[] = [];

      if (messageEvent) {
        events.push(
          await this.eventService.get(messageEvent.id, credentials.id),
        );
      }

      if (mediaEvent) {
        events.push(await this.eventService.get(mediaEvent.id, credentials.id));
      }

      return events;
    } catch (err) {
      // since we have errors lets rollback the changes we made
      await queryRunner.rollbackTransaction();
    } finally {
      // you need to release a queryRunner which was manually instantiated
      await queryRunner.release();
    }
  }
}
