import { Module, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Pool } from 'pg';
import { DbService } from './db.service';

@Module({
  imports: [ConfigModule.forRoot()],
  providers: [DbService],
  exports: [DbService],
})
export class DbModule {}
