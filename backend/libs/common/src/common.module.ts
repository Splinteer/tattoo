import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { DbModule } from './db/db.module';
import { StorageModule } from './storage/storage.module';
import { EntityMapperService } from './entity-mapper/entity-mapper.service';

@Module({
  imports: [DbModule, StorageModule],
  providers: [CommonService, EntityMapperService],
  exports: [CommonService, DbModule, StorageModule, EntityMapperService],
})
export class CommonModule {}
