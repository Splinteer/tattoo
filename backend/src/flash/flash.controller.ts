import {
  Body,
  Controller,
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
import { Credentials as ICredentials } from 'src/customer/customer.service';
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

  @Get('')
  @UseGuards(new AuthGuard())
  async getMine(@Credentials() credentials: ICredentials) {
    return this.flashService.get(credentials.shop_id);
  }

  @Get(':shopId')
  async get(@Param('shopId') shopId: string) {
    console.log(shopId);
  }
}
