import { Module } from '@nestjs/common';
import { CommonService } from './common.service';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule],
  providers: [CommonService],
  exports: [CommonService, DbModule],
})
export class CommonModule {}
