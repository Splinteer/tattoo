import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

export type Attachment = string;

export type Message = {
  id: string;
  chat_id: string;
  creation_date: Date;
  is_sender: boolean;
  content: string;
  is_read: boolean;
  attachments: Attachment[];
};

@Injectable()
export class ChatService {
  constructor(private readonly db: DbService) {
    this.getShopChats(
      '2d24ec73-d53b-451f-9d6f-89b9194c795d',
      '2023-09-04T01:47:28.564+02:00',
    );
  }

  async getCustomerChats(shopId: string, last_fetched_date: string) {
    return null;
  }

  async getShopChats(shopId: string, last_fetched_date: string) {
    const query = `--sql
      SELECT
          c.id AS id,
          c.project_id,
          p.name as project_name,
          c.creation_date AS creation_date,
          COALESCE(m.creation_date, c.creation_date) AS last_update,
          CONCAT_WS(' ', customer.firstname, customer.lastname) as contact_name,
          json_build_object(
            'id', customer.id,
            'got_profile_picture', customer.got_profile_picture,
            'profile_picture_version', customer.profile_picture_version
          ) as avatar,
          m.content as last_message,
          m.id IS NULL OR m.sender_id <> customer.id OR m.is_read as is_read
      FROM chat c

      INNER JOIN project p ON p.id = c.project_id
      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT
          m.id,
          m.chat_id,
          m.content,
          m.creation_date,
          m.sender_id,
          m.is_read
        FROM message m
        LEFT JOIN message_attachment ma ON m.id = ma.message_id
        WHERE chat_id = c.id
        GROUP BY m.id
        ORDER BY creation_date DESC
        LIMIT 1
      ) AS m ON c.id = m.chat_id

      WHERE p.shop_id=$1
      AND c.last_update < $2
      GROUP BY c.id, customer.id, p.name, m.id, m.sender_id, m.is_read, m.content, m.creation_date
      ORDER BY last_update DESC
      LIMIT 10
    `;

    const { rows: chats } = await this.db.query(query, [
      shopId,
      last_fetched_date,
    ]);

    return chats;
  }

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

  async getMessages(
    customerId: string,
    chatId: string,
    last_fetched_date: string,
    limit = 10,
  ) {
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

    const { rows: chats } = await this.db.query<Message>(query, [
      customerId,
      chatId,
      last_fetched_date,
    ]);

    return chats.reverse();
  }
}
