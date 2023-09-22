import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { Credentials } from 'src/auth/credentials/credentials.service';

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
          p.shop_id,
          c.creation_date AS creation_date,
          COALESCE(ce.creation_date, c.creation_date) AS last_update,
          CONCAT_WS(' ', customer.firstname, customer.lastname) as contact_name,
          json_build_object(
            'id', customer.id,
            'got_profile_picture', customer.got_profile_picture,
            'profile_picture_version', customer.profile_picture_version
          ) as avatar,
          ce.content as last_event,
          ce.id IS NULL OR ce.sender_id <> customer.id OR ce.is_read as is_read
      FROM chat c

      INNER JOIN project p ON p.id = c.project_id
      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT *
        FROM chat_event ce
        WHERE chat_id = c.id
        AND type = 'message'
        ORDER BY creation_date DESC
        LIMIT 1
      ) AS ce ON c.id = ce.chat_id

      WHERE p.shop_id=$1
      AND c.last_update < $2
      GROUP BY c.id, customer.id, p.shop_id, p.name, ce.id, ce.sender_id, ce.is_read, ce.content, ce.creation_date
      ORDER BY last_update DESC
      LIMIT 10
    `;

    const { rows: chats } = await this.db.query(query, [
      shopId,
      last_fetched_date,
    ]);

    return chats;
  }

  async getShopChat(chatId: string) {
    const query = `--sql
      SELECT
          c.id AS id,
          c.project_id,
          p.name as project_name,
          p.shop_id,
          c.creation_date AS creation_date,
          COALESCE(ce.creation_date, c.creation_date) AS last_update,
          CONCAT_WS(' ', customer.firstname, customer.lastname) as contact_name,
          json_build_object(
            'id', customer.id,
            'got_profile_picture', customer.got_profile_picture,
            'profile_picture_version', customer.profile_picture_version
          ) as avatar,
          ce.content as last_event,
          ce.id IS NULL OR ce.sender_id <> customer.id OR ce.is_read as is_read
      FROM chat c

      INNER JOIN project p ON p.id = c.project_id
      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT *
        FROM chat_event ce
        WHERE chat_id = c.id
        AND type = 'message'
        ORDER BY creation_date DESC
        LIMIT 1
      ) AS ce ON c.id = ce.chat_id

      WHERE c.id = $1
      GROUP BY c.id, customer.id, p.shop_id, p.name, ce.id, ce.sender_id, ce.is_read, ce.content, ce.creation_date
    `;

    const { rows: chats } = await this.db.query(query, [chatId]);

    return chats[0];
  }

  async checkChatAccess(
    credentials: Credentials,
    chatId: string,
  ): Promise<boolean> {
    const query = `--sql
      SELECT p.customer_id=$1 OR p.shop_id=$2 as can_access FROM chat c
      INNER JOIN project p ON p.id=c.project_id
      WHERE c.id=$3
    `;

    const {
      rows: [{ can_access }],
    } = await this.db.query<{ can_access: boolean }>(query, [
      credentials.id,
      credentials.shop_id,
      chatId,
    ]);

    return can_access;
  }

  async getChatByProject(projectId: string) {
    const query = `--sql
      SELECT * FROM chat c
      WHERE c.project_id=$1
    `;

    const {
      rows: [chat],
    } = await this.db.query<{ id: string }>(query, [projectId]);

    return chat;
  }
}
