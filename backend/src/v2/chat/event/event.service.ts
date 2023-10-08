import { BadRequestException, Inject, Injectable } from '@nestjs/common';
import { ChatEventSchema, ChatEventType } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '@app/common/storage/storage.service';
import {
  ChatEventMediaSchema,
  ChatEventMessageSchema,
} from './entity/event-types.entity';
import { DbService } from '@app/common/db/db.service';
import { ChatNotificationService } from '../chat-notification/chat-notification.service';

export type ChatEventBase = {
  id: string;
  chatId: string;
  creationDate: Date;
  isSender: boolean;
  isRead: boolean;
};

export type ChatEventMessage = ChatEventBase & {
  type: ChatEventType.MESSAGE;
  property: {
    text: string;
  };
};

export type ChatEventMedia = ChatEventBase & {
  type: ChatEventType.MEDIA;
  property: {
    urls: string[];
  };
};

export type ChatEventAppointmentNew = ChatEventBase & {
  type: ChatEventType.APPOINTMENT_NEW;
  property: {
    appointmentId: string;
  };
};

export type SimpleChatEvent = ChatEventBase & {
  type: ChatEventType.PROJECT_CREATED;
};

export type ChatEvent =
  | SimpleChatEvent
  | ChatEventMessage
  | ChatEventMedia
  | ChatEventAppointmentNew;

@Injectable()
export class EventService {
  constructor(
    @InjectRepository(ChatEventSchema)
    private chatEventRepository: Repository<ChatEventSchema>,
    private readonly chatNotificationService: ChatNotificationService,
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  async getAll(
    customerId: string,
    {
      chatId,
      date,
      shopId,
      eventId = null,
    }: {
      chatId?: string;
      date?: string;
      shopId?: string;
      eventId?: string;
    },
  ): Promise<ChatEvent[]> {
    let query = this.chatEventRepository
      .createQueryBuilder('chat_event')
      .leftJoinAndSelect(
        'chat_event_message',
        'message',
        "message.event_id = chat_event.id AND chat_event.type = 'message'",
      )
      .leftJoinAndSelect(
        'chat_event_media',
        'media',
        "media.event_id = chat_event.id AND chat_event.type = 'media'",
      )
      .leftJoinAndSelect(
        'chat_event_appointment_new',
        'appointment',
        "appointment.event_id = chat_event.id AND chat_event.type = 'appointment_new'",
      );

    if (eventId) {
      query = query.andWhere('chat_event.id = :eventId', { eventId });
    } else {
      if (!chatId) {
        throw new BadRequestException('Chat id is required');
      }

      query = query.andWhere('chat_event.chat_id = :chatId', { chatId });
    }

    if (date) {
      query = query.andWhere('chat_event.creation_date < :date', { date });
    }

    const events = await query
      .select([
        'chat_event.*',
        "CASE WHEN chat_event.type = 'message' THEN message.content ELSE null END as content",
        "CASE WHEN chat_event.type = 'media' THEN ARRAY_AGG(media.url) ELSE null END as urls",
        "CASE WHEN chat_event.type = 'appointment_new' THEN appointment.appointment_id ELSE null END as appointment_id",
      ])
      .orderBy('chat_event.creation_date', 'DESC')
      .groupBy('chat_event.id, message.content, appointment.appointment_id')
      .limit(10)
      .getRawMany();

    return Promise.all(
      events.map(async (event) => {
        const baseEvent = {
          id: event.id,
          chatId: event.chat_id,
          creationDate: event.creation_date,
          isSender: event.sender_id === customerId || event.shop_id === shopId,
          isRead: event.is_read,
        };

        if (event.type === 'message') {
          const property = { text: event.content };
          return { ...baseEvent, type: ChatEventType.MESSAGE, property };
        }

        if (event.type === 'media') {
          const property = {
            urls: await Promise.all(
              event.urls.map((url) => this.publicStorage.getSignedUrl(url)),
            ),
          };
          return { ...baseEvent, type: ChatEventType.MEDIA, property };
        }

        if (event.type === 'appointment_new') {
          const property = { appointmentId: event.appointment_id };
          return {
            ...baseEvent,
            type: ChatEventType.APPOINTMENT_NEW,
            property,
          };
        }

        return {
          ...baseEvent,
          type: event.type as ChatEventType.PROJECT_CREATED,
        };
      }),
    );
  }

  async get(eventId: string, customerId: string) {
    const [event] = await this.getAll(customerId, { eventId });

    return event;
  }

  async create(
    chatEventRepository: Repository<ChatEventSchema>,
    chatId: string,
    customerId: string,
    type: ChatEventType,
  ) {
    const event = new ChatEventSchema();
    event.chatId = chatId;
    event.senderId = customerId;
    event.type = type;

    return chatEventRepository.save(event);
  }

  async createMediaEvent(
    chatEventMediaRepository: Repository<ChatEventMediaSchema>,
    eventId: string,
    file: Express.Multer.File,
  ) {
    const attachmentId = DbService.getUUID();
    const event = new ChatEventMediaSchema();
    event.eventId = eventId;
    event.url = `chats/${eventId}/${attachmentId}`;

    await this.publicStorage.save(event.url, file, {
      public: false,
    });

    return chatEventMediaRepository.save(event);
  }

  async createMessageEvent(
    chatEventMessageRepository: Repository<ChatEventMessageSchema>,
    eventId: string,
    text: string,
  ) {
    const message = new ChatEventMessageSchema();
    message.eventId = eventId;
    message.content = text;

    return chatEventMessageRepository.save(message);
  }

  async getRecipientId(eventId: string) {
    const { recipient_id: recipientId } = await this.chatEventRepository
      .createQueryBuilder('chat_event')
      .innerJoin('project', 'p', 'p.id = chat_event.chat_id')
      .innerJoin('shop', 's', 's.id = p.shop_id')
      .select([
        'CASE WHEN chat_event.sender_id = p.customer_id THEN s.owner_id ELSE p.customer_id END AS recipient_id',
      ])
      .where('chat_event.id = :eventId', { eventId })
      .getRawOne();

    return recipientId;
  }

  async sendEvent(eventId: string) {
    const recipientId = await this.getRecipientId(eventId);
    if (!recipientId) {
      console.error(`Can't find recipiend id. Event id: ${eventId}`);
      return;
    }

    if (!this.chatNotificationService.checkUserConnected(recipientId)) {
      return;
    }

    const event = await this.get(eventId, recipientId);
    if (!event) {
      console.error(`Can't find event. Event id: ${eventId}`);
      return;
    }

    this.chatNotificationService.sendMessageToUser(recipientId, event);
  }
}
