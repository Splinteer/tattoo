import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

export enum MemberType {
  tattoo_artist = 'tattoo_artist',
  manager = 'manager',
}

export interface Member {
  customer_id: string;
  type: MemberType;

  can_read_message: boolean;
  can_write_message: boolean;
}

@Injectable()
export class MemberService {
  private tableName = 'member';

  constructor(private database: DbService) {}

  public async create(
    customer_id: string,
    type: MemberType,
    can_read_message: boolean,
    can_write_message: boolean,
  ): Promise<Member> {
    const member = {
      id: DbService.getUUID(),
      customer_id,
      type,
      can_read_message,
      can_write_message,
    };

    return <Promise<Member>>this.database.insertOne(this.tableName, member);
  }

  public async updateCanReadMessage(
    customer_id: string,
    can_read_message: boolean,
  ) {
    const fields = {
      can_read_message,
    };

    await this.database.updateObject(this.tableName, customer_id, fields);
  }

  public async updateCanWriteMessage(
    customer_id: string,
    can_write_message: boolean,
  ) {
    const fields = {
      can_write_message,
    };

    await this.database.updateObject(this.tableName, customer_id, fields);
  }
}
