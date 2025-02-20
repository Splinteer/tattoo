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
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { FlashService } from './flash.service';

@Controller('flash')
export class FlashController {
  constructor(private readonly flashService: FlashService) {}

  @Post('create')
  @UseInterceptors(FileInterceptor('image'))
  @UseGuards(new AuthGuard())
  async create(
    @Credentials() credentials: ICredentials,
    @Body() body: any,
    @UploadedFile() image: Express.Multer.File,
  ) {
    const flash = await this.flashService.create(credentials.shop_id, body);
    flash.image_url = await this.flashService.updateImage(
      credentials.shop_id,
      flash.id,
      image,
    );

    return flash;
  }

  @Post('')
  @UseGuards(new AuthGuard())
  async getMine(
    @Credentials() credentials: ICredentials,
    @Body()
    {
      lastDate,
      available,
      limit = 9,
    }: { lastDate?: string; available?: boolean; limit?: number },
  ) {
    return this.flashService.getByShop(
      credentials.shop_url,
      limit,
      available,
      lastDate,
    );
  }

  @Get(':id')
  async get(@Param('id') id: string) {
    return this.flashService.get(id);
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
    const flash = await this.flashService.get(id);
    if (!flash || flash.shop_id !== credentials.shop_id) {
      throw new ForbiddenException();
    }

    const updatedFlash = await this.flashService.update(id, body);
    if (image) {
      await this.flashService.updateImage(
        updatedFlash.shop_id,
        updatedFlash.id,
        image,
      );
    }

    return updatedFlash;
  }

  @Delete(':id')
  @UseGuards(new AuthGuard())
  async delete(
    @Param('id') id: string,
    @Credentials() credentials: ICredentials,
  ) {
    const flash = await this.flashService.get(id);

    if (!flash || flash.shop_id !== credentials.shop_id) {
      throw new ForbiddenException();
    }

    await this.flashService.delete(id);
  }

  @Post('shop/:shopUrl')
  async getByShop(
    @Param('shopUrl') shopUrl: string,
    @Body()
    {
      lastDate,
      available,
      limit = 9,
    }: { lastDate?: string; available?: boolean; limit?: number },
  ) {
    return this.flashService.getByShop(shopUrl, limit, available, lastDate);
  }
}
