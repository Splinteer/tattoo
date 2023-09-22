import {
  Body,
  Controller,
  Get,
  Inject,
  MessageEvent,
  Param,
  Post,
  Query,
  Req,
  NotFoundException,
  Sse,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { ShopGuard } from 'src/v1/shop/shop.guard';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable } from 'rxjs';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { Request } from 'express';
import { StorageService } from '@app/common/storage/storage.service';
import {
  ChatEvent,
  ChatEventService,
  ChatEventType,
} from './chat-event/chat-event.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatNotificationService: ChatNotificationService,
    private readonly chatEventService: ChatEventService,
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  @Get()
  @UseGuards(new AuthGuard())
  async getCustomerChats(
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
  ) {
    return this.chatService.getCustomerChats(credentials.id, date);
  }

  @Post('read')
  @UseGuards(new ShopGuard())
  async readChat(
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
    @Body('chatId') chatId: string,
  ) {
    return this.chatEventService.markAsRead(chatId, date);
  }

  @Get('shop')
  @UseGuards(new ShopGuard())
  async getShopChats(
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
  ) {
    return this.chatService.getShopChats(credentials.shop_id, date);
  }

  @Get('shop/:chatId')
  @UseGuards(new ShopGuard())
  async getShopChat(
    @Credentials()
    credentials: ICredentials,
    @Param('chatId') chatId: string,
  ) {
    const canAccessChat = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );
    if (!canAccessChat) {
      throw new NotFoundException();
    }

    return this.chatService.getShopChat(chatId);
  }

  @Get(':chatId/events')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async getEvents(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
  ): Promise<ChatEvent[]> {
    const canAccessChat = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );
    if (!canAccessChat) {
      throw new NotFoundException();
    }

    const events = await this.chatEventService.getEvents(
      credentials.id,
      chatId,
      date,
    );

    return Promise.all(
      events.map(async (event) => {
        if (event.type === ChatEventType.media) {
          event.content = await this.publicStorage.getSignedUrl(event.content);
        }

        return event;
      }),
    );
  }

  @Post(':chatId/event')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async addEvent(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Body('content') content: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<ChatEvent[]> {
    const canAccessChat = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );
    if (!canAccessChat) {
      throw new NotFoundException();
    }

    const events: Omit<ChatEvent, 'is_sender'>[] = [];
    if (files?.length) {
      let attachments = await this.chatEventService.addMediaEvents(
        chatId,
        credentials.id,
        files,
      );

      attachments = await Promise.all(
        attachments.map(async (attachment) => {
          this.chatEventService
            .sendEventToUser(attachment.id)
            .catch(console.error);

          attachment.content = await this.publicStorage.getSignedUrl(
            attachment.content,
          );

          return attachment;
        }),
      );
    }

    if (content.length) {
      const event = await this.chatEventService.addEvent(
        chatId,
        credentials.id,
        ChatEventType.message,
        content,
      );

      events.push(event);

      this.chatEventService.sendEventToUser(event.id).catch(console.error);
    }

    return events.map((event) => ({ ...event, is_sender: true }));
  }

  @Sse('sync')
  @UseGuards(new AuthGuard())
  sse(
    @Req() request: Request,
    @Credentials()
    credentials: ICredentials,
  ): Observable<MessageEvent> {
    return this.chatNotificationService.addClient(credentials.id, request);
  }
}
