import { Body, Controller, Post, UseGuards, UsePipes } from '@nestjs/common';
import {
  AutomaticAvailabilityTimeUnit,
  AvailabilityService,
  AvailabilitySettings,
} from './availability.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { ShopService } from '../shop.service';
import { DefaultAvailabilityService } from './default-availability/default-availability.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { DateTime } from 'luxon';

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

    await this.generateAvailabilityForShop(shop, body.start_day, body.end_day);
  }

  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async automaticAvailibilityGenerator() {
    const today = DateTime.now();
    const rangesToGenerate: AutomaticAvailabilityTimeUnit[] = [];
    const monthlyIntervalsToGenerate: number[] = [];
    const weeklyIntervalsToGenerate: number[] = [];
    if (today.day === 1) {
      rangesToGenerate.push(AutomaticAvailabilityTimeUnit.month);
    }
    if (today.weekday === 1) {
      rangesToGenerate.push(AutomaticAvailabilityTimeUnit.week);
    }

    if (!rangesToGenerate.length) {
      return;
    }

    for (let interval = 1; interval <= 12; interval++) {
      if (
        rangesToGenerate.includes(AutomaticAvailabilityTimeUnit.month) &&
        today.month % interval === 0
      ) {
        monthlyIntervalsToGenerate.push(interval);
      }
      if (
        rangesToGenerate.includes(AutomaticAvailabilityTimeUnit.week) &&
        today.weekNumber % interval === 0
      ) {
        weeklyIntervalsToGenerate.push(interval);
      }
    }

    const shopsToGenerateAvailability =
      await this.availabilityService.getShopsByUpdateIntervals(
        monthlyIntervalsToGenerate,
        weeklyIntervalsToGenerate,
      );

    await Promise.all(
      shopsToGenerateAvailability.map((shop) => {
        const endDay = today
          .plus({
            [shop.repeat_availability_time_unit]:
              Number(shop.repeat_availability_every) - 1,
          })
          .endOf(shop.repeat_availability_time_unit as any);

        return this.generateAvailabilityForShop(
          shop,
          today.toFormat('yyyy-MM-dd'),
          endDay.toFormat('yyyy-MM-dd'),
          true,
        );
      }),
    );
  }

  private async generateAvailabilityForShop(
    shop: { id: string; min_appointment_time: number },
    start_day: string,
    end_day: string,
    automatic: boolean,
  ) {
    const daysToExclude =
      await this.availabilityService.getDaysToExcludeWithDefaultAvailability(
        shop.id,
        start_day,
        end_day,
      );

    const unavailabilities =
      await this.availabilityService.getUnavailabilityByDay(
        shop.id,
        start_day,
        end_day,
      );

    const defaultAvailabilities = await this.defaultAvailabilityService.getRaw(
      shop.id,
    );

    return this.availabilityService.generateAvailability(
      shop.id,
      { start_day, end_day },
      shop.min_appointment_time,
      defaultAvailabilities,
      daysToExclude,
      unavailabilities,
      automatic,
    );
  }
}
