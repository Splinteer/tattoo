import { DbService } from '@app/common/db/db.service';
import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';

export interface ShopCreationBody {
  name: string;
  url: string;
  description: string;
  logo: File[];
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
}
export interface Shop {
  id: string;
  owner_id: string;
  creation_date: string;
  last_update: string;
  name: string;
  url: string;
  description: string;
  got_profile_picture: boolean;
  profile_picture_version: number;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
}

@Injectable()
export class ShopService {
  constructor(
    @Inject('public') private readonly publicBucket: Bucket,
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
    const file = this.publicBucket.file(`shops/${shopId}/logo`);
    await file.save(logo.buffer);
    await file.makePublic();

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

  public async getByUrl(url: string) {
    const { rows } = await this.db.query<Shop>(
      'SELECT * FROM shop WHERE url=$1',
      [url],
    );

    return rows[0];
  }

  public async update(userId: string, data: ShopCreationBody) {
    const { rows } = await this.db.query<Shop>(
      `UPDATE shop SET name = $2, url = $3, description = $8, instagram = $4, twitter = $5, facebook = $6, website = $7
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
      ],
    );

    return rows[0];
  }
}
