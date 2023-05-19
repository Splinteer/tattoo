import { DbService } from './../../libs/common/src/db/db.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UserInformations } from 'src/auth/supertokens/supertokens.service';

export interface Customer {
  id: string;
  supertokens_id: string;
  creation_date: Date;
  last_update: Date;
  email: string;
  firstname?: string;
  lastname?: string;
  birthday?: Date;
  profile_picture?: string;
  pronouns?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  personal_information?: string;
}

export interface Credentials {
  id: string;
  supertokens_id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  profile_picture?: string;

  // Shop
  shop_id?: string;
  shop_name?: string;
  shop_url?: string;
}

@Injectable()
export class CustomerService {
  constructor(private readonly database: DbService) {}

  async create(
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

  async getCustomerCredentials(supertokensId: string): Promise<Credentials> {
    const select = [
      'customer.id',
      'customer.supertokens_id',
      'customer.email',
      'customer.firstname',
      'customer.lastname',
      'customer.profile_picture',
      'shop.id as shop_id',
      'shop.name as shop_name',
      'shop.url as shop_url',
    ];

    const { rows } = await this.database.query(
      `SELECT ${select.join(',')} FROM customer
        LEFT JOIN shop ON shop.owner_id = customer.id
        WHERE supertokens_id = $1`,
      [supertokensId],
    );

    return rows[0] as Credentials;
  }
}
