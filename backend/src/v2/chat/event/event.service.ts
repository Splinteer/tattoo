import { Inject, Injectable } from '@nestjs/common';
import { ChatEventSchema, ChatEventType } from './event.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StorageService } from '@app/common/storage/storage.service';

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
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  async getAdll(chatId: string) {
    return this.chatEventRepository.find({ where: { chatId } });
  }

  async getAll(
    chatId: string,
    date: string,
    customerId: string,
    shopId?: string,
  ): Promise<ChatEvent[]> {
    const results = await this.chatEventRepository
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
      )
      .where(
        `
          chat_event.chat_id = :chatId
          AND chat_event.creation_date < :lastDate
        `,
        { chatId, lastDate: date },
      )
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
      results.map(async (result) => {
        const baseEvent = {
          id: result.id,
          chatId: result.chat_id,
          creationDate: result.creation_date,
          isSender:
            result.sender_id === customerId || result.shop_id === shopId,
          isRead: result.is_read,
        };

        if (result.type === 'message') {
          const property = { text: result.content };
          return { ...baseEvent, type: ChatEventType.MESSAGE, property };
        }

        if (result.type === 'media') {
          const property = {
            urls: await Promise.all(
              result.urls.map((url) => this.publicStorage.getSignedUrl(url)),
            ),
          };
          return { ...baseEvent, type: ChatEventType.MEDIA, property };
        }

        if (result.type === 'appointment_new') {
          const property = { appointmentId: result.appointment_id };
          return {
            ...baseEvent,
            type: ChatEventType.APPOINTMENT_NEW,
            property,
          };
        }

        return {
          ...baseEvent,
          type: result.type as ChatEventType.PROJECT_CREATED,
        };
      }),
    );
  }
}
