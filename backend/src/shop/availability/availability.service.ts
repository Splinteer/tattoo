import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

export enum AutomaticAvailabilityTimeUnit {
  week = 'week',
  month = 'month',
}

export interface AvailabilitySettings {
  auto_generate_availability: boolean;
  repeat_availability_every: number;
  repeat_availability_time_unit: AutomaticAvailabilityTimeUnit;
  min_appointment_time: number;
}

@Injectable()
export class AvailabilityService {
  constructor(private readonly db: DbService) {}

  public async updateSettings(
    shopId: string,
    body: AvailabilitySettings,
  ): Promise<void> {
    await this.db.query(
      `UPDATE shop SET
        auto_generate_availability=$2,
        repeat_availability_every=$3,
        repeat_availability_time_unit=$4,
        min_appointment_time=$5
      WHERE id=$1`,
      [
        shopId,
        body.auto_generate_availability,
        body.repeat_availability_every,
        body.repeat_availability_time_unit,
        body.min_appointment_time,
      ],
    );
  }
}
