import { Module } from '@nestjs/common';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/v1/auth/auth.module';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { ChatEventService } from './chat-event/chat-event.service';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [ChatController],
  providers: [ChatService, ChatNotificationService, ChatEventService],
  exports: [ChatService, ChatEventService],
})
export class ChatModule {}
