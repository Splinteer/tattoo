import {
  Body,
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ShopService } from './shop.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/customer/customer.service';
import { SessionService } from 'src/auth/session/session.service';

@Controller('shop')
@UseGuards(new AuthGuard())
export class ShopController {
  constructor(
    private readonly shopService: ShopService,
    private readonly sessionService: SessionService,
  ) {
    this.sessionService.refreshSession('4a898b5c-4801-440c-83d4-84f76c28905f');
  }

  @Post('create')
  @UseInterceptors(FileInterceptor('logo'))
  async create(
    @Credentials()
    credentials: ICredentials,
    @Body() body: any,
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
  async get(
    @Credentials()
    { id }: ICredentials,
  ) {
    return await this.shopService.get(id);
  }

  @Post('update')
  @UseInterceptors(FileInterceptor('logo'))
  async update(
    @Credentials()
    credentials: ICredentials,
    @Body() body: any,
    @UploadedFile() logo: Express.Multer.File,
  ) {
    const newShop = await this.shopService.update(credentials.id, body);

    if (logo) {
      await this.shopService.updateLogo(newShop.id, logo);
      newShop.got_profile_picture = true;
    }

    await this.sessionService.refreshSession(credentials.supertokens_id);

    return newShop;
  }
}
