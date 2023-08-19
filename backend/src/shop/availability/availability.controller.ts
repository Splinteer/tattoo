import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import {
  AvailabilityService,
  AvailabilitySettings,
} from './availability.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { ShopService } from '../shop.service';
import { DefaultAvailabilityService } from './default-availability/default-availability.service';

@Controller('availability')
@UseGuards(new AuthGuard())
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
    private readonly defaultAvailabilityService: DefaultAvailabilityService,
    private readonly shopService: ShopService,
  ) {}

  @Post('settings')
  async updateSettings(
    @Credentials()
    credentials: ICredentials,
    @Body()
    body: AvailabilitySettings,
  ) {
    return this.availabilityService.updateSettings(credentials.shop_id, body);
  }

  @Post('generate')
  async generateAvailability(
    @Credentials()
    credentials: ICredentials,
    @Body()
    body: { start_day: string; end_day: string },
  ) {
    const shop = await this.shopService.getById(credentials.shop_id);

    const daysToExclude =
      await this.availabilityService.getDaysToExcludeWithDefaultAvailability(
        shop.id,
        body.start_day,
        body.end_day,
      );

    const unavailabilities =
      await this.availabilityService.getUnavailabilityByDay(
        shop.id,
        body.start_day,
        body.end_day,
      );

    const defaultAvailabilities = await this.defaultAvailabilityService.getRaw(
      shop.id,
    );

    return this.availabilityService.generateAvailability(
      shop.id,
      body,
      shop.min_appointment_time,
      defaultAvailabilities,
      daysToExclude,
      unavailabilities,
      false,
    );
  }
}
