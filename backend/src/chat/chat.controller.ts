import {
  Body,
  Controller,
  Get,
  MessageEvent,
  Param,
  Post,
  Query,
  Req,
  Sse,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ChatService, Message } from './chat.service';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { ShopGuard } from 'src/shop/shop.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { Observable, Subject, map, tap } from 'rxjs';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { Request } from 'express';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatNotificationService: ChatNotificationService,
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
    return this.chatService.getShopChat(chatId);
  }

  @Get(':chatId/messages')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async getMessages(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
  ): Promise<Message[]> {
    return this.chatService.getMessages(credentials.id, chatId, date);
  }

  @Post(':chatId/message')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async addMessage(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Body('content') content: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<Message> {
    const message = await this.chatService.addMessage(
      chatId,
      credentials.id,
      content,
    );

    const attachments = [];
    if (files?.length) {
      // TODO
    }

    this.chatService.sendMessageToUser(message.id).catch(console.error);

    return {
      ...message,
      is_sender: true,
      attachments,
    };
  }

  @Sse('sync')
  @UseGuards(new AuthGuard())
  sse(
    @Req() request: Request,
    @Credentials()
    credentials: ICredentials,
  ): Observable<MessageEvent> {
    console.log('connected');
    return this.chatNotificationService.addClient(credentials.id, request);
  }

  @Get('temp')
  temp(@Query('message') message: string) {
    return this.addMessage(
      '7c914559-a6cf-47c6-9429-503f011052cb',
      { id: '5831feb1-0ccd-4715-878b-0c73a1cd8a8f' } as ICredentials,
      message,
      [],
    );
  }
}
