import { DbService } from '@app/common/db/db.service';
import { Bucket } from '@google-cloud/storage';
import { Inject, Injectable } from '@nestjs/common';

export interface Gallery {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  image_version: number;
}

@Injectable()
export class GalleryService {
  constructor(
    @Inject('public') private readonly publicBucket: Bucket,
    private readonly db: DbService,
  ) {}

  public async create(shopId: string, data: any): Promise<Gallery> {
    const { rows } = await this.db.query<Gallery>(
      'INSERT INTO gallery (shop_id, name, description, image_url) VALUES ($1, $2, $3,  $4) RETURNING *',
      [shopId, data.name, data.description ?? null, ''],
    );

    return rows[0];
  }

  public async update(id: string, data: any): Promise<Gallery> {
    const { rows } = await this.db.query<Gallery>(
      'UPDATE gallery SET name = $2, description = $3 WHERE id = $1 RETURNING *',
      [id, data.name, data.description ?? null],
    );

    if (!rows[0]) {
      throw new Error(`No gallery found with id: ${id}`);
    }

    return rows[0];
  }

  public async updateImage(
    shopId: string,
    galleryId: string,
    image: Express.Multer.File,
  ): Promise<string> {
    const key = `shops/${shopId}/gallerys/${galleryId}`;
    const file = this.publicBucket.file(key);
    await file.save(image.buffer);
    await file.makePublic();

    await this.db.query(
      'UPDATE gallery SET image_url=$2, image_version = image_version + 1  WHERE id=$1',
      [galleryId, key],
    );

    return key;
  }

  public async getByShop(shopUrl: string, limit: number, lastDate?: string) {
    let query =
      'SELECT gallery.* FROM gallery INNER JOIN shop ON shop.id=gallery.shop_id WHERE shop.url=$1';
    const values: any = [shopUrl, limit];
    if (lastDate) {
      query += ' AND gallery.creation_date < $3';
      values.push(new Date(lastDate));
    }
    query += ' ORDER BY gallery.creation_date DESC LIMIT $2';

    const { rows } = await this.db.query<Gallery>(query, values);

    return rows;
  }

  public async get(id: string) {
    const { rows } = await this.db.query<Gallery>(
      'SELECT * FROM gallery WHERE id=$1',
      [id],
    );

    return rows[0];
  }

  public async delete(id: string) {
    const { rows } = await this.db.query<Gallery>(
      'DELETE FROM gallery WHERE id=$1',
      [id],
    );

    return rows[0];
  }
}
