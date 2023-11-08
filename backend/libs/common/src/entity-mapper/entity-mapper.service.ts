import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Injectable()
export class EntityMapperService {
  constructor(private dataSource: DataSource) {}

  mapEntity<T>(dbRow: Record<string, any>, entity: new () => T): T {
    const formattedEntity = new entity();

    const metadata = this.dataSource
      .createQueryBuilder()
      .connection.getMetadata(entity);

    metadata.columns.forEach((column) => {
      formattedEntity[column.propertyName] = dbRow[column.databaseName];
    });

    return formattedEntity;
  }
}
