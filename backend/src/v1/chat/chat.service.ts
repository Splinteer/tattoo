import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { Credentials } from 'src/v1/auth/credentials/credentials.service';

@Injectable()
export class ChatService {
  constructor(private readonly db: DbService) {}

  async getCustomerChats(shopId: string, last_fetched_date: string) {
    return null;
  }

  async getShopChats(shopId: string, last_fetched_date: string) {
    const query = `--sql
      SELECT
          p.id AS id,
          p.id as project_id,
          p.name as project_name,
          p.shop_id,
          p.created_at AS creation_date,
          COALESCE(ce.creation_date, p.created_at) AS last_update,
          CONCAT_WS(' ', customer.firstname, customer.lastname) as contact_name,
          json_build_object(
            'id', customer.id,
            'got_profile_picture', customer.got_profile_picture,
            'profile_picture_version', customer.profile_picture_version
          ) as avatar,
          'hello' as last_event, --TEMP TODO
          ce.id IS NULL OR ce.sender_id <> customer.id OR ce.is_read as is_read
      FROM project p
      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT *
        FROM chat_event ce
        WHERE project_id = p.id
        AND type = 'message'
        ORDER BY creation_date DESC
        LIMIT 1
      ) AS ce ON p.id = ce.project_id

      WHERE p.shop_id=$1
      AND p.updated_at < $2
      GROUP BY p.id, p.created_at, customer.id, p.shop_id, p.name, ce.id, ce.sender_id, ce.is_read, ce.creation_date
      ORDER BY p.updated_at DESC
      LIMIT 10
    `;

    const { rows: chats } = await this.db.query(query, [
      shopId,
      last_fetched_date,
    ]);

    return chats;
  }

  async getShopChat(projectId: string) {
    const query = `--sql
      SELECT
          p.id AS id,
          p.id as project_id,
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
      FROM project p

      INNER JOIN customer ON customer.id = p.customer_id
      LEFT JOIN LATERAL(
        SELECT *
        FROM chat_event ce
        WHERE chat_id = p.id
        AND type = 'message'
        ORDER BY creation_date DESC
        LIMIT 1
      ) AS ce ON p.id = ce.chat_id

      WHERE p.id = $1
      GROUP BY p.id, customer.id, p.shop_id, p.name, ce.id, ce.sender_id, ce.is_read, ce.content, ce.creation_date
    `;

    const { rows: chats } = await this.db.query(query, [projectId]);

    return chats[0];
  }

  async checkChatAccess(
    credentials: Credentials,
    projectId: string,
  ): Promise<boolean> {
    const query = `--sql
      SELECT customer_id=$1 OR shop_id=$2 as can_access FROM project
      WHERE id=$3
    `;

    const {
      rows: [{ can_access }],
    } = await this.db.query<{ can_access: boolean }>(query, [
      credentials.id,
      credentials.shop_id,
      projectId,
    ]);

    return can_access;
  }

  async getChatByProject(projectId: string) {
    const query = `--sql
      SELECT * FROM project
      WHERE id=$1
    `;

    const {
      rows: [chat],
    } = await this.db.query<{ id: string }>(query, [projectId]);

    return chat;
  }
}
