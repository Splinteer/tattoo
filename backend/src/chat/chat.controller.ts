import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
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
import { MessageDTO } from './message.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

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

  @Post(':chatId/message')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FilesInterceptor('attachments'))
  async addMessages(
    @Param('chatId') chatId: string,
    @Credentials()
    credentials: ICredentials,
    @Body('content') content: string,
    @UploadedFiles() files?: Array<Express.Multer.File>,
  ): Promise<Message> {
    console.log(chatId, credentials.id, content);
    const message = await this.chatService.addMessage(
      chatId,
      credentials.id,
      content,
    );

    const attachments = [];
    if (files?.length) {
    }

    return {
      ...message,
      is_sender: true,
      attachments,
    };
  }
}
