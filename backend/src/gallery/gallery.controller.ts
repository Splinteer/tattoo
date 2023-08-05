import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  Param,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(private readonly galleryService: GalleryService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(new AuthGuard())
  async create(
    @Credentials() credentials: ICredentials,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const gallery = await this.galleryService.create(credentials.shop_id, body);
    gallery.image_url = await this.galleryService.updateImage(
      credentials.shop_id,
      gallery.id,
      image,
    );

    return gallery;
  }

  @Post('')
  @UseGuards(new AuthGuard())
  async getMine(
    @Credentials() credentials: ICredentials,
    @Body() { lastDate, limit = 9 }: { lastDate?: string; limit?: number },
  ) {
    return this.galleryService.getByShop(credentials.shop_url, limit, lastDate);
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.galleryService.get(id);
  }

  @Post(':id')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(new AuthGuard())
  async update(
    @Param('id') id: string,
    @Credentials() credentials: ICredentials,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const gallery = await this.galleryService.get(id);
    if (!gallery || gallery.shop_id !== credentials.shop_id) {
      throw new ForbiddenException();
    }

    const updatedGallery = await this.galleryService.update(id, body);
    if (image) {
      console.log(image);
      await this.galleryService.updateImage(
        updatedGallery.shop_id,
        updatedGallery.id,
        image,
      );
    }

    return updatedGallery;
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  async delete(
    @Param('id') id: string,
    @Credentials() credentials: ICredentials,
  ) {
    const gallery = await this.galleryService.get(id);

    if (!gallery || gallery.shop_id !== credentials.shop_id) {
      throw new ForbiddenException();
    }

    await this.galleryService.delete(id);
  }

  @Post('shop/:shopUrl')
  async getByShop(
    @Param('shopUrl') shopUrl: string,
    @Body() { lastDate, limit = 9 }: { lastDate?: string; limit?: number },
  ) {
    return this.galleryService.getByShop(shopUrl, limit, lastDate);
  }
}
