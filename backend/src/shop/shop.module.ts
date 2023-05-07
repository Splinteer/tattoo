import { Module } from '@nestjs/common';
import { ShopController } from './shop.controller';
import { ShopService } from './shop.service';
import { CommonModule } from '@app/common';
import { AuthModule } from 'src/auth/auth.module';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [ShopController],
  providers: [ShopService],
})
export class ShopModule {}
