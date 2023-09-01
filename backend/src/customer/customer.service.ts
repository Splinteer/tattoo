import { StorageService } from '@app/common/storage/storage.service';
import { DbService } from './../../libs/common/src/db/db.service';
import { Inject, Injectable } from '@nestjs/common';
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
  got_profile_picture: boolean;
  profile_picture_version?: string;
  pronouns?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  personal_information?: string;
  address?: string;
  address2?: string;
  city?: string;
  zipcode?: string;
}

export interface CustomerUpdateBody {
  firstname?: string;
  lastname?: string;
  birthday?: Date;
  pronouns?: string;
  phone?: string;
  personal_information?: string;
  instagram?: string;
  twitter?: string;
  address?: string;
  address2?: string;
  city?: string;
  zipcode?: string;
}

@Injectable()
export class CustomerService {
  constructor(
    @Inject('public') private readonly publicStorage: StorageService,
    private readonly database: DbService,
  ) {}

  async get(supertokensId: string): Promise<Customer> {
    const { rows } = await this.database.query<Customer>(
      `SELECT * FROM customer WHERE supertokens_id = $1`,
      [supertokensId],
    );

    return rows[0];
  }

  public async updatePicture(
    userId: string,
    image: Express.Multer.File,
  ): Promise<void> {
    const path = `profile_picture/${userId}`;
    await this.publicStorage.save(path, image, { public: true });

    await this.database.query(
      'UPDATE customer SET got_profile_picture=TRUE, profile_picture_version = profile_picture_version + 1 WHERE id=$1',
      [userId],
    );
  }

  public async update(userId: string, data: CustomerUpdateBody) {
    const { rows } = await this.database.query<Customer>(
      `UPDATE customer
        SET
            firstname = $2,
            lastname = $3,
            birthday = $4,
            pronouns = $5,
            phone = $6,
            personal_information = $7,
            instagram = $8,
            twitter = $9,
            address = $10,
            address2 = $11,
            city = $12,
            zipcode = $13
        WHERE id = $1
        RETURNING *;`,
      [
        userId,
        data.firstname?.trim() ?? null,
        data.lastname?.trim() ?? null,
        data.birthday ?? null,
        data.pronouns?.trim() ?? null,
        data.phone?.trim() ?? null,
        data.personal_information?.trim() ?? null,
        data.instagram?.trim() ?? null,
        data.twitter?.trim() ?? null,
        data.address?.trim() ?? null,
        data.address2?.trim() ?? null,
        data.city?.trim() ?? null,
        data.zipcode?.trim() ?? null,
      ],
    );

    return rows[0];
  }
}
