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
import { Attachment, ChatService, Message } from './chat.service';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { ShopGuard } from 'src/shop/shop.guard';
import { AuthGuard } from 'src/auth/auth.guard';
import { FilesInterceptor } from '@nestjs/platform-express';
import { NotFoundError, Observable, Subject, map, tap } from 'rxjs';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { Request, Response } from 'express';
import { StorageService } from '@app/common/storage/storage.service';

@Controller('chat')
export class ChatController {
  constructor(
    private readonly chatService: ChatService,
    private readonly chatNotificationService: ChatNotificationService,
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
    return this.chatService.markChatAsRead(chatId, date);
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

  @Get(':chatId/messages')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async getMessages(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Query('date') date: string,
  ): Promise<Message[]> {
    const canAccessChat = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );
    if (!canAccessChat) {
      throw new NotFoundException();
    }

    const messages = await this.chatService.getMessages(
      credentials.id,
      chatId,
      date,
    );

    return Promise.all(
      messages.map(async (message) => {
        if (message.attachments.length) {
          message.attachments = await Promise.all(
            message.attachments.map((attachment) =>
              this.publicStorage.getSignedUrl(attachment),
            ),
          );
        }

        return message;
      }),
    );
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
    const canAccessChat = await this.chatService.checkChatAccess(
      credentials,
      chatId,
    );
    if (!canAccessChat) {
      throw new NotFoundException();
    }

    const message = await this.chatService.addMessage(
      chatId,
      credentials.id,
      content,
    );

    let attachments: string[] = [];
    if (files?.length) {
      const addedAttachments = await this.chatService.addAttachments(
        message.id,
        message.chat_id,
        files,
      );

      attachments = await Promise.all(
        addedAttachments.map((attachment) =>
          this.publicStorage.getSignedUrl(attachment.image_url),
        ),
      );
    }

    this.chatService.sendMessageToUser(message.id).catch(console.error);

    return {
      ...message,
      is_sender: true,
      attachments,
    };
  }

  // @Get('message/:messageId/:attachmentId')
  // @UseGuards(new AuthGuard())
  // async getAttachmentData(
  //   @Credentials()
  //   credentials: ICredentials,
  //   @Param('messageId') messageId: string,
  //   @Param('attachmentId') attachmentId: string,
  // ) {
  //   const attachment = await this.chatService.getAttachment(
  //     messageId,
  //     attachmentId,
  //   );

  //   const signelUrl = await this.publicStorage.getSignedUrl(
  //     attachment.image_url,
  //   );

  //   return { url: signelUrl };
  // }

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
