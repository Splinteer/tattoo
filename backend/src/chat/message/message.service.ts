import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';
import { ChatNotificationService } from '../chat-notification/chat-notification.service';

export type Attachment = {
  id: string;
  message_id: string;
  image_url: string;
};

export type Message = {
  id: string;
  chat_id: string;
  creation_date: Date;
  is_sender: boolean;
  content: string;
  is_read: boolean;
  attachments: string[];
};
@Injectable()
export class MessageService {
  constructor(
    private readonly db: DbService,
    private readonly chatNotificationService: ChatNotificationService,
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  async addMessage(chatId: string, senderId: string, content: string) {
    const query = `--sql
      INSERT INTO message(chat_id, sender_id, content) VALUES ($1, $2, $3) RETURNING *;
    `;

    const {
      rows: [message],
    } = await this.db.query<{
      id: string;
      chat_id: string;
      creation_date: Date;
      sender_id: string;
      content: string;
      is_read: boolean;
    }>(query, [chatId, senderId, content]);

    return message;
  }

  public async addAttachments(
    messageId: string,
    chatId: string,
    attachments: Express.Multer.File[],
  ): Promise<Attachment[]> {
    return Promise.all(
      attachments.map(async (attachment) => {
        const attachmentId = DbService.getUUID();
        const path = `chats/${chatId}/${attachmentId}`;

        await this.publicStorage.save(path, attachment, {
          public: false,
        });

        const query = `--sql
          INSERT INTO public.message_attachment (message_id, image_url)
          VALUES($1, $2) RETURNING *;
        `;

        const {
          rows: [insertedAttachment],
        } = await this.db.query<Attachment>(query, [messageId, path]);

        return insertedAttachment;
      }),
    );
  }

  async getMessages(
    customerId: string,
    chatId: string,
    last_fetched_date: string,
    limit = 10,
  ): Promise<Message[]> {
    const query = `--sql
      SELECT
        m.*,
        m.sender_id = $1 as is_sender,
        COALESCE(
          array_agg(ma.image_url) FILTER (WHERE ma.message_id IS NOT NULL),
          ARRAY[]::varchar[]
        ) AS attachments
      FROM message m
      LEFT JOIN message_attachment ma ON m.id = ma.message_id
      WHERE m.chat_id=$2
      AND m.creation_date < $3
      GROUP BY m.id
      ORDER BY creation_date DESC
      LIMIT ${limit}
    `;

    const { rows: messages } = await this.db.query<Message>(query, [
      customerId,
      chatId,
      last_fetched_date,
    ]);

    return messages;
  }

  async getMessage(id: string): Promise<Message> {
    const query = `--sql
      SELECT
        m.*,
        FALSE as is_sender,
        COALESCE(
          array_agg(ma.image_url) FILTER (WHERE ma.message_id IS NOT NULL),
          ARRAY[]::varchar[]
        ) AS attachments
      FROM message m
      LEFT JOIN message_attachment ma ON m.id = ma.message_id
      WHERE m.id = $1
      GROUP BY m.id
      ORDER BY creation_date DESC
    `;

    const {
      rows: [message],
    } = await this.db.query<Message>(query, [id]);

    if (message.attachments.length) {
      message.attachments = await Promise.all(
        message.attachments.map((attachment) =>
          this.publicStorage.getSignedUrl(attachment),
        ),
      );
    }

    return message;
  }

  async getRecipientIdWithMessageId(messageId: string): Promise<string> {
    const query = `--sql
      SELECT
        CASE
            WHEN m.sender_id = p.customer_id  THEN s.owner_id
            ELSE p.customer_id
        END AS recipient_id
      FROM message m
      INNER JOIN chat c ON c.id=m.chat_id
      INNER JOIN project p ON p.id=c.project_id
      INNER JOIN shop s ON s.id=p.shop_id
      WHERE m.id = $1
    `;

    const { rows: ids } = await this.db.query<{ recipient_id: string }>(query, [
      messageId,
    ]);

    return ids[0].recipient_id;
  }

  async sendMessageToUser(messageId: string) {
    const recipientId = await this.getRecipientIdWithMessageId(messageId);
    if (!recipientId) {
      console.error(`Can't find recipiend id. Message id: ${messageId}`);
      return;
    }

    if (!this.chatNotificationService.checkUserConnected(recipientId)) {
      return;
    }

    const message = await this.getMessage(messageId);
    if (!message) {
      console.error(`Can't find message. Message id: ${messageId}`);
      return;
    }

    this.chatNotificationService.sendMessageToUser(recipientId, message);
  }

  // async getAttachment(
  //   messageId: string,
  //   attachmentId: string,
  // ): Promise<Attachment> {
  //   const query = `--sql
  //     SELECT * FROM message_attachment
  //     WHERE id=$2
  //     AND message_id=$1
  //   `;

  //   const {
  //     rows: [attachment],
  //   } = await this.db.query<Attachment>(query, [messageId, attachmentId]);

  //   return attachment;
  // }
}
