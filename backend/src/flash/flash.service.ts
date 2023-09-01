import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';

export interface Flash {
  id: string;
  shop_id: string;
  shop_url: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  image_version: number;
  available: boolean;
  price_range_start?: number;
  price_range_end?: number;
}

@Injectable()
export class FlashService {
  constructor(
    @Inject('public') private readonly publicStorage: StorageService,
    private readonly db: DbService,
  ) {}

  public async create(shopId: string, data: any): Promise<Flash> {
    const { rows } = await this.db.query<Flash>(
      `
        WITH new_flash AS (
          INSERT INTO flash (shop_id, name, description, image_url, available, price_range_start, price_range_end)
          VALUES ($1, $2, $3, $4, $5, $6, $7)
          RETURNING *
        )
        SELECT new_flash.*, shop.url as shop_url
        FROM new_flash
        INNER JOIN shop ON new_flash.shop_id = shop.id;
      `,
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

  public async update(id: string, data: any): Promise<Flash> {
    const { rows } = await this.db.query<Flash>(
      `
        WITH updated_flash AS (
          UPDATE flash SET name = $2, description = $3, available = $4, price_range_start = $5, price_range_end = $6 WHERE id = $1 RETURNING *
        )
        SELECT updated_flash.*, shop.url as shop_url
        FROM updated_flash
        INNER JOIN shop ON updated_flash.shop_id = shop.id
      `,
      [
        id,
        data.name,
        data.description ?? null,
        data.available,
        data.price_range_start ?? null,
        data.price_range_end ?? null,
      ],
    );

    if (!rows[0]) {
      throw new Error(`No flash found with id: ${id}`);
    }

    return rows[0];
  }

  public async updateImage(
    shopId: string,
    flashId: string,
    image: Express.Multer.File,
  ): Promise<string> {
    const path = `shops/${shopId}/flashs/${flashId}`;
    await this.publicStorage.save(path, image, { public: true });

    await this.db.query(
      'UPDATE flash SET image_url=$2, image_version = image_version + 1  WHERE id=$1',
      [flashId, path],
    );

    return path;
  }

  public async getByShop(
    shopUrl: string,
    limit: number,
    available?: boolean,
    lastDate?: string,
  ) {
    let query = `
        SELECT flash.*, shop.url as shop_url
        FROM flash
        INNER JOIN shop ON shop.id=flash.shop_id
        WHERE shop.url=$1
      `;
    const values: any = [shopUrl, limit];
    if (lastDate) {
      query += ' AND flash.creation_date < $' + (values.length + 1);
      values.push(new Date(lastDate));
    }
    if (available !== undefined) {
      query += ' AND flash.available=$' + (values.length + 1);
      values.push(available);
    }
    query += ' ORDER BY flash.creation_date DESC LIMIT $2';

    const { rows } = await this.db.query<Flash>(query, values);

    return rows;
  }

  public async get(id: string) {
    const { rows } = await this.db.query<Flash>(
      `
        SELECT flash.*, shop.url as shop_url
        FROM flash
        INNER JOIN shop ON shop.id=flash.shop_id
        WHERE flash.id=$1`,
      [id],
    );

    return rows[0];
  }

  public async delete(id: string) {
    await this.db.begin();
    try {
      const { rows } = await this.db.query<Flash>(
        'DELETE FROM flash WHERE id=$1 RETURNING *',
        [id],
      );

      const deletedFlash = rows[0];

      await this.publicStorage.delete(deletedFlash.image_url);

      return rows[0];
    } catch (error) {
      await this.db.rollback();
    }
  }
}
