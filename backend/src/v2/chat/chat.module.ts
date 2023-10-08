import { Module } from '@nestjs/common';
import { ChatService } from './chat.service';
import { ChatSchema } from './chat.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';
import { ChatEventSchema } from './event/event.entity';
import {
  ChatEventAppointmentNewSchema,
  ChatEventMediaSchema,
  ChatEventMessageSchema,
} from './event/entity/event-types.entity';
import { CommonModule } from '@app/common';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { ChatController } from './chat.controller';

@Module({
  imports: [
    CommonModule,
    TypeOrmModule.forFeature([
      ChatSchema,
      ChatEventSchema,
      ChatEventAppointmentNewSchema,
      ChatEventMediaSchema,
      ChatEventMessageSchema,
    ]),
  ],
  controllers: [EventController, ChatController],
  providers: [ChatService, EventService, ChatNotificationService],
})
export class ChatModule {}
