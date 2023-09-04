import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { DateTime } from 'luxon';

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
          c.creation_date AS chat_creation_date,
          CONCAT_WS(' ', customer.firstname, customer.lastname) as contact_name,
          json_build_object(
            'id', customer.id,
            'got_profile_picture', customer.got_profile_picture,
            'profile_picture_version', customer.profile_picture_version
          ) as avatar,
          COALESCE(MAX(m.creation_date), NOW()) AS last_message_update,
            array_agg(
              json_build_object(
                  'id', m.id,
                  'chat_id', m.chat_id,
                  'creation_date', m.creation_date,
                  'is_sender', CASE WHEN m.sender_id <> p.customer_id THEN true ELSE false END,
                  'content', m.content,
                  'is_read', m.is_read,
                  'attachments', m.attachments
              )
              ORDER BY m.creation_date
            ) FILTER (WHERE m.id IS NOT NULL)
           AS messages
      FROM chat c

      INNER JOIN project p ON p.id = c.project_id
      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT
          m.id,
          m.chat_id,
          m.creation_date,
          m.sender_id,
          m.content,
          m.is_read,
          COALESCE(
            array_agg(ma.image_url) FILTER (WHERE ma.message_id IS NOT NULL),
            ARRAY[]::varchar[]
          ) AS attachments
        FROM message m
        LEFT JOIN message_attachment ma ON m.id = ma.message_id
        WHERE chat_id = c.id
        GROUP BY m.id
        ORDER BY creation_date DESC
        LIMIT 5
      ) AS m ON c.id = m.chat_id

      WHERE p.shop_id=$1
      AND c.last_update < $2

      GROUP BY c.id, customer.id
      ORDER BY c.creation_date DESC
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
}
