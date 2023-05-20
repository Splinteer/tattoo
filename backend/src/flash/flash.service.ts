import { DbService } from '@app/common/db/db.service';
import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';

export interface Flash {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  available: boolean;
  price_range_start?: number;
  price_range_end?: number;
}

@Injectable()
export class FlashService {
  constructor(
    @Inject('public') private readonly publicBucket: Bucket,
    private readonly db: DbService,
  ) {}

  public async create(shopId: string, data: any): Promise<Flash> {
    const { rows } = await this.db.query<Flash>(
      'INSERT INTO flash (shop_id, name, description, image_url, available, price_range_start, price_range_end) VALUES ($1, $2, $3,  $4, $5, $6, $7) RETURNING *',
      [
        shopId,
        data.name,
        data.description ?? null,
        '',
        data.available,
        data.price_range_start ?? null,
        data.price_range_end ?? null,
      ],
    );

    return rows[0];
  }

  public async updateImage(
    shopId: string,
    flashId: string,
    image: Express.Multer.File,
  ): Promise<string> {
    const key = `shops/${shopId}/flashs/${flashId}`;
    const file = this.publicBucket.file(key);
    await file.save(image.buffer);
    await file.makePublic();

    await this.db.query('UPDATE flash SET image_url=$2 WHERE id=$1', [
      flashId,
      key,
    ]);

    return key;
  }

  public async get(shopId: string, limit = 9) {
    const { rows } = await this.db.query<Flash>(
      'SELECT * FROM flash WHERE shop_id=$1 ORDER BY creation_date DESC LIMIT $2',
      [shopId, limit],
    );

    return rows;
  }
}
