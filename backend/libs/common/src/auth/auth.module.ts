import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [ConfigModule],
  providers: [AuthGuard],
  exports: [],
})
export class AuthModule {}
