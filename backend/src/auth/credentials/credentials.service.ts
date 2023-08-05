import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { Customer } from 'src/customer/customer.service';
import { UserInformations } from '../supertokens/supertokens.service';

export interface Credentials {
  id: string;
  supertokens_id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  got_profile_picture?: boolean;
  profile_picture_version?: string;

  // Shop
  shop_id?: string;
  shop_name?: string;
  shop_url?: string;
  shop_got_picture?: boolean;
  shop_image_version?: number;
}

@Injectable()
export class CredentialsService {
  constructor(private readonly database: DbService) {}

  async createUser(
    supertokensId: string,
    email: string,
    infos: UserInformations,
  ): Promise<Customer> {
    return this.database.insertOne('customer', {
      id: DbService.getUUID(),
      supertokens_id: supertokensId,
      email: email,
      firstname: infos.firstname,
      lastname: infos.lastname,
      birthday: infos.birthday,
    }) as Promise<Customer>;
  }

  async get(supertokensId: string): Promise<Credentials> {
    const select = [
      'customer.id',
      'customer.supertokens_id',
      'customer.email',
      'customer.firstname',
      'customer.lastname',
      'customer.got_profile_picture',
      'customer.profile_picture_version',
      'shop.id as shop_id',
      'shop.name as shop_name',
      'shop.url as shop_url',
      'shop.got_profile_picture as shop_got_picture',
      'shop.profile_picture_version as shop_image_version',
    ];

    const { rows } = await this.database.query<Credentials>(
      `SELECT ${select.join(',')} FROM customer
        LEFT JOIN shop ON shop.owner_id = customer.id
        WHERE supertokens_id = $1`,
      [supertokensId],
    );

    return rows[0];
  }
}
