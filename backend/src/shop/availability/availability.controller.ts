import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import {
  AvailabilityService,
  AvailabilitySettings,
} from './availability.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';

@Controller('availability')
@UseGuards(new AuthGuard())
export class AvailabilityController {
  constructor(private readonly availabilityService: AvailabilityService) {}

  @Post('settings')
  async updateSettings(
    @Credentials()
    credentials: ICredentials,
    @Body()
    body: AvailabilitySettings,
  ) {
    return this.availabilityService.updateSettings(credentials.shop_id, body);
  }
}
