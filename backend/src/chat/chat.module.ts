import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { MessageService } from './message/message.service';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatNotificationService, MessageService],
})
export class ChatModule {}
