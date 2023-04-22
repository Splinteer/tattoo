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
  email: string;
  firstname?: string;
  lastname?: string;
  profile_picture?: string;
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
    const { rows } = await this.database.query(
      'SELECT id, email, firstname, lastname, profile_picture FROM customer WHERE supertokens_id = $1',
      [supertokensId],
    );

    if (rows.length === 0) {
      throw new UnauthorizedException();
    }

    return rows[0] as Credentials;
  }
}
