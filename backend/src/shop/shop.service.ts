import { DbService } from '@app/common/db/db.service';
import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';

@Injectable()
export class ShopService {
  constructor(
    @Inject('public') private readonly publicBucket: Bucket,
    private readonly db: DbService,
  ) {}

  public async create(userId: string, data: any): Promise<any> {
    const { rows } = await this.db.query(
      'INSERT INTO shop (owner_id, name, url, instagram, twitter, facebook, website) VALUES ($1, $2, $3,  $4, $5, $6, $7) RETURNING *',
      [
        userId,
        data.name,
        data.url,
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
  ): Promise<any> {
    const file = this.publicBucket.file(`shops/${shopId}/logo`);
    await file.save(logo.buffer);
    await file.makePublic();

    await this.db.query(
      'UPDATE shop SET got_profile_picture=TRUE WHERE id=$1',
      [shopId],
    );
  }

  public async get(ownerId: string) {
    const { rows } = await this.db.query(
      'SELECT * FROM shop WHERE owner_id=$1',
      [ownerId],
    );

    return rows[0];
  }

  public async update(userId: string, data: any): Promise<any> {
    const { rows } = await this.db.query(
      `UPDATE shop SET name = $2, url = $3, instagram = $4, twitter = $5, facebook = $6, website = $7
        WHERE owner_id = $1 RETURNING *;`,
      [
        userId,
        data.name,
        data.url,
        data.instagram ?? null,
        data.twitter ?? null,
        data.facebook ?? null,
        data.website ?? null,
      ],
    );

    return rows[0];
  }
}
