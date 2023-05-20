import { Module } from '@nestjs/common';
import { FlashController } from './flash.controller';
import { FlashService } from './flash.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [FlashController],
  providers: [FlashService],
})
export class FlashModule {}
