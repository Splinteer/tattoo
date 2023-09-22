import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';

export type ShopCreationBody = {
  name: string;
  url: string;
  description: string;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
};

export type ShopUpdateBody = ShopCreationBody & {
  booking_condition: string;
};

export enum AutomaticAvailabilityTimeUnit {
  week = 'week',
  month = 'month',
}

export type Shop = {
  id: string;
  owner_id: string;
  creation_date: string;
  last_update: string;
  name: string;
  url: string;
  description: string;
  booking_condition: string;
  got_profile_picture: boolean;
  profile_picture_version: number;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
  auto_generate_availability: boolean;
  repeat_availability_every: number;
  repeat_availability_time_unit: AutomaticAvailabilityTimeUnit;
  min_appointment_time: number;
};

@Injectable()
export class ShopService {
  constructor(
    @Inject('public') private readonly publicStorage: StorageService,
    private readonly db: DbService,
  ) {}

  public async create(userId: string, data: ShopCreationBody) {
    const { rows } = await this.db.query<Shop>(
      'INSERT INTO shop (owner_id, name, url, description, instagram, twitter, facebook, website) VALUES ($1, $2, $3,  $4, $5, $6, $7, $8) RETURNING *',
      [
        userId,
        data.name.trim(),
        data.url.trim(),
        data.description.replace(/\n+/g, '\n').trim(),
        data.instagram ?? null,
        data.twitter ?? null,
        data.facebook ?? null,
        data.website ?? null,
      ],
    );

    return rows[0];
  }

  public async updateLogo(
    shopId: string,
    logo: Express.Multer.File,
  ): Promise<void> {
    const path = `shops/${shopId}/logo`;
    await this.publicStorage.save(path, logo, { public: true });

    await this.db.query(
      'UPDATE shop SET got_profile_picture=TRUE, profile_picture_version = profile_picture_version + 1 WHERE id=$1',
      [shopId],
    );
  }

  public async get(ownerId: string) {
    const { rows } = await this.db.query<Shop>(
      'SELECT * FROM shop WHERE owner_id=$1',
      [ownerId],
    );

    return rows[0];
  }

  public async getById(id: string) {
    const { rows } = await this.db.query<Shop>(
      'SELECT * FROM shop WHERE id=$1',
      [id],
    );

    return rows[0];
  }

  public async getByUrl(url: string) {
    const { rows } = await this.db.query<Shop>(
      'SELECT * FROM shop WHERE url=$1',
      [url],
    );

    return rows[0];
  }

  public async update(userId: string, data: ShopUpdateBody) {
    const { rows } = await this.db.query<Shop>(
      `UPDATE shop SET name = $2, url = $3, description = $8, booking_condition = $9, instagram = $4, twitter = $5, facebook = $6, website = $7
        WHERE owner_id = $1 RETURNING *;`,
      [
        userId,
        data.name.trim(),
        data.url.trim(),
        data.instagram ?? null,
        data.twitter ?? null,
        data.facebook ?? null,
        data.website ?? null,
        (data.description ?? '').replace(/\n+/g, '\n').trim(),
        (data.booking_condition ?? '').replace(/\n+/g, '\n').trim(),
      ],
    );

    return rows[0];
  }

  public async getRating(shopId: string) {
    const { rows } = await this.db.query<{
      appointments: number;
      note: number | null;
    }>(
      `SELECT COUNT(p.id) AS appointments, round(CAST(AVG(p.shop_rating) as numeric), 1)
      AS note  FROM project p
      INNER JOIN appointment a ON a.project_id =p.id AND a.is_confirmed = TRUE AND a.start_date <  NOW()
      WHERE p.shop_id=$1;`,
      [shopId],
    );

    return rows[0];
  }
}
