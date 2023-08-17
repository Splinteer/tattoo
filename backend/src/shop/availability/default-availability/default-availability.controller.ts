import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import {
  DayAvailability,
  DefaultAvailabilityService,
} from './default-availability.service';

@Controller('default-availability')
export class DefaultAvailabilityController {
  constructor(
    private readonly defaultAvailabilityService: DefaultAvailabilityService,
  ) {}

  @Get('')
  @UseGuards(new AuthGuard())
  async get(@Credentials() credentials: ICredentials) {
    return await this.defaultAvailabilityService.get(credentials.shop_id);
  }
  @Post('')
  @UseGuards(new AuthGuard())
  async updateDefaultAvailability(
    @Credentials() credentials: ICredentials,
    @Body() body: DayAvailability[],
  ) {
    return await this.defaultAvailabilityService.update(
      credentials.shop_id,
      body,
    );
  }
}
