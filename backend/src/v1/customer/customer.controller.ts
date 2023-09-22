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
import { CustomerService, CustomerUpdateBody } from './customer.service';
import { SessionService } from 'src/v1/auth/session/session.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';

@Controller('customer')
export class CustomerController {
  constructor(
    private readonly customerService: CustomerService,
    private readonly sessionService: SessionService,
  ) {}

  @Get()
  @UseGuards(new AuthGuard())
  public getMine(@Credentials() credentials: ICredentials) {
    return this.customerService.get(credentials.supertokens_id);
  }

  @Get(':userId')
  public get(@Param('userId') userId: string) {
    return this.customerService.get(userId);
  }

  @Post('')
  @UseGuards(new AuthGuard())
  @UseInterceptors(FileInterceptor('profile_picture'))
  async update(
    @Credentials()
    credentials: ICredentials,
    @Body() body: CustomerUpdateBody,
    @UploadedFile() profile_picture: Express.Multer.File,
  ) {
    await this.customerService.update(credentials.id, body);

    if (profile_picture) {
      await this.customerService.updatePicture(credentials.id, profile_picture);
    }

    await this.sessionService.refreshSession(credentials.supertokens_id);
  }
}
