import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

export default interface Shop {
  owner_id: string;

  name: string;
  url: string;

  show_city: boolean;
  vacation_mode: boolean;
}

@Injectable()
export class ShopService {
  private tableName = 'shop';

  constructor(private database: DbService) {}

  public async get(userId: string) {
    const query = `SELECT shop.*, can_read_message, can_write_message FROM shop
      INNER JOIN member ON shop.id=member.shop_id
      WHERE member_id=$1`;

    const { rows } = await this.database.query(query, [userId]);

    return rows[0] ?? null;
  }

  public async create(
    name: string,
    url: string,
    show_city: boolean,
    vacation_mode: boolean,
  ): Promise<Shop> {
    const shop = {
      id: DbService.getUUID(),
      name,
      url,
      show_city,
      vacation_mode,
    };

    return <Promise<Shop>>this.database.insertOne(this.tableName, shop);
  }

  public async updateName(id: string, name: string) {
    const fields = {
      name,
    };

    await this.database.updateObject(this.tableName, id, fields);
  }

  public async updateUrl(id: string, url: string) {
    const fields = {
      url,
    };

    await this.database.updateObject(this.tableName, id, fields);
  }

  public async updateShowCity(id: string, show_city: boolean) {
    const fields = {
      show_city,
    };

    await this.database.updateObject(this.tableName, id, fields);
  }

  public async updateVacationMode(id: string, vacation_mode: boolean) {
    const fields = {
      vacation_mode,
    };

    await this.database.updateObject(this.tableName, id, fields);
  }
}
