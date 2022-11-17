import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { v4 as uuidV4 } from 'uuid';

@Injectable()
export class DbService extends Pool {
  constructor(configService: ConfigService) {
    super({
      user: configService.get<string>('POSTGRES_USER'),
      host: configService.get<string>('POSTGRES_HOST'),
      database: configService.get<string>('POSTGRES_DB'),
      password: configService.get<string>('POSTGRES_PASSWORD'),
      port: configService.get<number>('POSTGRES_PORT'),
    });
  }

  static getUUID = () => uuidV4();

  public begin = () => this.query('BEGIN');
  public commit = () => this.query('COMMIT');
  public rollback = () => this.query('ROLLBACK');

  public async insertOne(
    table: string,
    object: { [key: string]: any },
  ): Promise<{ [key: string]: any }> {
    const select = Object.keys(object);
    const valueIndex = select.map((key, index) => `$${index + 1}`);
    const values = Object.values(object);

    const query = `INSERT INTO ${table}(${select.join(
      ',',
    )}) VALUES (${valueIndex.join(',')}) RETURNING *`;

    let results: any;
    try {
      const { rows } = await this.query(query, values);
      await this.end();
      results = rows;
    } catch (error: any) {
      if (error?.code === '23505') {
        const { constraint, detail } = error;

        throw new Error(
          `db.ts-insertOne: Duplicate key\n  Table: ${table}\n  Constraint: ${constraint}\n  Detail: ${detail}`,
        );
      }
    }

    if (!results || results.length === 0) {
      console.debug(object);
      throw new Error(
        `db.ts-insertOne: Impossible to insert object into table ${table}`,
      );
    }

    return results[0];
  }

  public async updateObject(
    table: string,
    id: string,
    fields: { [key: string]: any },
  ): Promise<void> {
    const values = [...Object.values(fields), id];

    let query = `UPDATE ${table} SET `;
    query +=
      Object.keys(fields)
        .map((key, index) => `${key}=$${index + 1}`)
        .join(',') + ' ';
    query += `WHERE id=$${values.length + 1}`;

    try {
      await this.query(query, values);
      await this.end();
    } catch ({ constraint, detail }: any) {
      throw new Error(
        `db.ts-updateObject: Impossible to update\n  Table: ${table}\n Id: ${id}\n  Constraint: ${constraint}\n  Detail: ${detail}`,
      );
    }
  }
}
