import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';
import { ChatNotificationService } from '../chat-notification/chat-notification.service';

export enum ChatEventType {
  project_created = 'project_created',
  project_cancelled = 'project_cancelled',
  project_rejected = 'project_rejected',
  project_completed = 'project_completed',
  message = 'message',
  media = 'media',
  appointment_new = 'appointment_new',
  appointment_accepted = 'appointment_accepted',
  deposit_request = 'deposit_request',
  deposit_paid = 'deposit_paid',
}

export type ChatEvent = {
  id: string;
  chat_id: string;
  creation_date: Date;
  is_sender: boolean;
  type: ChatEventType;
  content?: string;
  is_read: boolean;
};
@Injectable()
export class ChatEventService {
  constructor(
    private readonly db: DbService,
    private readonly chatNotificationService: ChatNotificationService,
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  async addEvent(
    chatId: string,
    senderId: string,
    type: ChatEventType,
    content?: string,
  ): Promise<Omit<ChatEvent, 'is_sender'>> {
    const query = `--sql
      INSERT INTO chat_event(chat_id, sender_id, type, content) VALUES ($1, $2, $3, $4) RETURNING *;
    `;

    const {
      rows: [event],
    } = await this.db.query<ChatEvent>(query, [
      chatId,
      senderId,
      type,
      content,
    ]);

    return event;
  }

  public async addMediaEvents(
    chatId: string,
    senderId: string,
    attachments: Express.Multer.File[],
  ): Promise<Omit<ChatEvent, 'is_sender'>[]> {
    return Promise.all(
      attachments.map(async (attachment) => {
        const attachmentId = DbService.getUUID();
        const path = `chats/${chatId}/${attachmentId}`;

        await this.publicStorage.save(path, attachment, {
          public: false,
        });

        return this.addEvent(chatId, senderId, ChatEventType.media, path);
      }),
    );
  }

  async getEvents(
    customerId: string,
    chatId: string,
    last_fetched_date: string,
    limit = 10,
  ): Promise<ChatEvent[]> {
    const query = `--sql
      SELECT
        ce.*,
        ce.sender_id = $1 as is_sender
      FROM chat_event ce
      WHERE ce.chat_id=$2
      AND ce.creation_date < $3
      GROUP BY ce.id
      ORDER BY creation_date DESC
      LIMIT ${limit}
    `;

    const { rows: events } = await this.db.query<ChatEvent>(query, [
      customerId,
      chatId,
      last_fetched_date,
    ]);

    return events;
  }

  async getEvent(id: string): Promise<ChatEvent> {
    const query = `--sql
      SELECT
        ce.*,
        FALSE as is_sender,
      FROM chat_event ce
      WHERE ce.id = $1
    `;

    const {
      rows: [event],
    } = await this.db.query<ChatEvent>(query, [id]);

    if (event.type === ChatEventType.media) {
      event.content = await this.publicStorage.getSignedUrl(event.content);
    }

    return event;
  }

  async getRecipientIdWithEventId(eventId: string): Promise<string> {
    const query = `--sql
      SELECT
        CASE
            WHEN ce.sender_id = p.customer_id  THEN s.owner_id
            ELSE p.customer_id
        END AS recipient_id
      FROM chat_event ce
      INNER JOIN chat c ON c.id=ce.chat_id
      INNER JOIN project p ON p.id=c.project_id
      INNER JOIN shop s ON s.id=p.shop_id
      WHERE ce.id = $1
    `;

    const { rows: ids } = await this.db.query<{ recipient_id: string }>(query, [
      eventId,
    ]);

    return ids[0].recipient_id;
  }

  async sendEventToUser(eventId: string) {
    const recipientId = await this.getRecipientIdWithEventId(eventId);
    if (!recipientId) {
      console.error(`Can't find recipiend id. Message id: ${eventId}`);
      return;
    }

    if (!this.chatNotificationService.checkUserConnected(recipientId)) {
      return;
    }

    const event = await this.getEvent(eventId);
    if (!event) {
      console.error(`Can't find event. Event id: ${eventId}`);
      return;
    }

    this.chatNotificationService.sendMessageToUser(recipientId, event);
  }

  async markAsRead(chatId: string, date: string) {
    const query = `--sql
      UPDATE chat_event SET is_read=TRUE WHERE chat_id=$1 AND creation_date <= $2;
    `;

    await this.db.query(query, [chatId, date]);
  }
}
