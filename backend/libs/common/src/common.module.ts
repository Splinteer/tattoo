import { Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { CommonService } from './common.service';
import { DbModule } from './db/db.module';

@Module({
  imports: [DbModule, AuthModule],
  providers: [CommonService],
  exports: [CommonService, DbModule],
})
export class CommonModule {}
