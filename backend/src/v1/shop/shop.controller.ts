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
import { ShopCreationBody, ShopService, ShopUpdateBody } from './shop.service';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { SessionService } from 'src/v1/auth/session/session.service';

@Controller('shop')
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly sessionService: SessionService,
  ) {}

  @Post('create')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Credentials()
    credentials: ICredentials,
    @Body()
    body: ShopCreationBody,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const newShop = await this.shopService.create(credentials.id, body);

    if (logo) {
      await this.shopService.updateLogo(newShop.id, logo);
      newShop.got_profile_picture = true;
    }

    await this.sessionService.refreshSession(credentials.supertokens_id);

    return newShop;
  }

  @Get()
  @UseGuards(new AuthGuard())
  async get(
    @Credentials()
    { id }: ICredentials,
  ) {
    return await this.shopService.get(id);
  }

  @Post('update')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Credentials()
    credentials: ICredentials,
    @Body() body: ShopUpdateBody,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const shop = await this.shopService.update(credentials.id, body);

    if (logo) {
      await this.shopService.updateLogo(shop.id, logo);
    }

    await this.sessionService.refreshSession(credentials.supertokens_id);
  }

  @Get(':url')
  async getByUrl(@Param('url') url: string) {
    const shop = await this.shopService.getByUrl(url);
    const { note, appointments } = await this.shopService.getRating(shop.id);

    return {
      ...shop,
      note,
      appointments,
    };
  }
}
