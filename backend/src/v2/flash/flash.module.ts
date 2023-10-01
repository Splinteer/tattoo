import { Module } from '@nestjs/common';
import { FlashService } from './flash.service';
import { FlashSchema } from './flash.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ShopSchema } from 'src/entitiees/shop.entity';

@Module({
  imports: [TypeOrmModule.forFeature([FlashSchema, ShopSchema])],
  providers: [FlashService],
})
export class FlashModule {}
