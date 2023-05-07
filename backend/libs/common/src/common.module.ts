import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { DbModule } from './db/db.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [DbModule, StorageModule],
  providers: [CommonService],
  exports: [CommonService, DbModule, StorageModule],
})
export class CommonModule {}
