import { DbService } from './../../libs/common/src/db/db.service';
import { Injectable } from '@nestjs/common';
import { UserInformations } from 'src/auth/supertokens/supertokens.service';

export interface Customer {
  id: string;
  supertokensId: string;
  email: string;
  firstname: string;
  lastname: string;
  birthday: string;
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

  async getCustomerCredentials(supertokensId: string): Promise<Customer> {
    const { rows } = await this.database.query(
      'SELECT * FROM customer WHERE supertokens_id = $1',
      [supertokensId],
    );

    return rows[0] as Promise<Customer>;
  }
}
