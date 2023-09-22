import { Module } from '@nestjs/common';
import { GalleryController } from './gallery.controller';
import { GalleryService } from './gallery.service';
import { AuthModule } from 'src/v1/auth/auth.module';
import { CommonModule } from '@app/common';

@Module({
  imports: [CommonModule, AuthModule],
  controllers: [GalleryController],
  providers: [GalleryService],
})
export class GalleryModule {}
