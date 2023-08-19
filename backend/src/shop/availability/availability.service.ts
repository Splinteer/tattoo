import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { DefaultAvailability } from './default-availability/default-availability.service';
import { DateTime } from 'luxon';

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

export interface DateRange {
  start_date_time: Date;
  end_date_time: Date;
}

export interface LinkedDateRange extends DateRange {
  id: string;
  shop_id: string;
}

export interface Availability extends DateRange {
  automatic: boolean;
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

  public async getAvailability(
    shopId: string,
    start_day: string,
    end_day: string,
  ) {
    const query = `
      SELECT start_date_time, end_date_time, automatic
        FROM availability
        WHERE shop_id = $1
          AND date BETWEEN $2 AND $3
      `;

    const { rows } = await this.db.query<Availability>(query, [
      shopId,
      start_day,
      end_day,
    ]);

    return rows;
  }

  public async getDaysToExcludeWithDefaultAvailability(
    shopId: string,
    start_day: string,
    end_day: string,
  ): Promise<string[]> {
    const query = `
        WITH date_series AS (
          SELECT
              generate_series(
                  start_date_time::date,
                  end_date_time::date,
                  interval '1 day'
              )::date AS date
          FROM
              public.availability
          WHERE shop_id = $1
      )
      SELECT date
      FROM  date_series
      WHERE date BETWEEN $2 AND $3
      ORDER BY
          date;
      `;

    const { rows } = await this.db.query<{
      date: Date;
    }>(query, [shopId, start_day, end_day]);

    return rows.map((row) =>
      DateTime.fromJSDate(row.date).toFormat('yyyy-MM-dd'),
    );
  }

  public async getUnavailability(
    shopId: string,
    start_day: string,
    end_day: string,
  ) {
    const query = `
        SELECT start_date_time, end_date_time
        FROM unavailability
        WHERE shop_id = $1
          AND start_date_time::date BETWEEN $2 AND $3
    `;

    const { rows } = await this.db.query<DateRange>(query, [
      shopId,
      start_day,
      end_day,
    ]);

    return rows;
  }

  public async getUnavailabilityByDay(
    shopId: string,
    start_day: string,
    end_day: string,
  ) {
    const query = `
      WITH date_series AS (
          SELECT
              id,
              shop_id,
              generate_series(
                  start_date_time::date,
                  end_date_time::date,
                  interval '1 day'
              )::date AS unavailability_date
          FROM
              public.unavailability
          WHERE shop_id = $1
      )
      SELECT
          unavailability.id,
          unavailability.shop_id,
          CASE
              WHEN unavailability_date = start_date_time::date THEN start_date_time
              ELSE unavailability_date::timestamp
          END AS start_date_time,
          CASE
              WHEN unavailability_date = end_date_time::date THEN end_date_time
              ELSE (unavailability_date + interval '1 day' - interval '1 second')::timestamp
          END AS end_date_time
      FROM
          date_series
      INNER JOIN public.unavailability ON date_series.id = unavailability.id
      WHERE start_date_time::date BETWEEN $2 AND $3
      ORDER BY
          id,
          start_date_time;
    `;

    const { rows } = await this.db.query<LinkedDateRange>(query, [
      shopId,
      start_day,
      end_day,
    ]);

    return rows;
  }

  public async generateAvailability(
    shopId: string,
    { start_day, end_day }: { start_day: string; end_day: string },
    min_appointment_time: number,
    defaultAvailabilities: DefaultAvailability[],
    daysToExclude: string[],
    unavailabilities: Awaited<
      ReturnType<typeof AvailabilityService.prototype.getUnavailability>
    >,
    isAutomatic = true,
  ) {
    const generatedAvailabilities: DateRange[] = [];
    const startDate = new Date(start_day);
    const endDate = new Date(end_day);

    for (
      let currentDay = new Date(startDate);
      currentDay <= endDate;
      currentDay.setDate(currentDay.getDate() + 1)
    ) {
      // Check if availabilities already exist for this day
      const currentDayFormatted =
        DateTime.fromJSDate(currentDay).toFormat('yyyy-MM-dd');
      if (daysToExclude.includes(currentDayFormatted)) {
        continue;
      }

      const dayOfWeek = currentDay.getDay();

      // Get default availability for the day
      const defaultAvailabilitiesForCurrentDay = defaultAvailabilities.filter(
        (da) => da.start_day <= dayOfWeek && da.end_day >= dayOfWeek,
      );

      if (defaultAvailabilitiesForCurrentDay.length === 0) {
        continue;
      }

      const availabilitiesForCurrentDay: DateRange[] =
        this.getAvailabilitiesBasedOnDefaults(
          defaultAvailabilitiesForCurrentDay,
          currentDay,
        );

      // Get unavailabilities
      const unavailabilitiesForCurrentDay = unavailabilities.filter(
        (u) =>
          DateTime.fromJSDate(u.start_date_time).toFormat('yyyy-MM-dd') ===
          currentDayFormatted,
      );

      if (!unavailabilitiesForCurrentDay.length) {
        generatedAvailabilities.push(...availabilitiesForCurrentDay);
      } else {
        const filteredAvailabilities =
          this.getAvailabilitiesFilteredByUnavailabilities(
            availabilitiesForCurrentDay,
            unavailabilitiesForCurrentDay,
            min_appointment_time,
          );
        generatedAvailabilities.push(...filteredAvailabilities);
      }
    }

    if (generatedAvailabilities.length) {
      this.addAvailabilities(shopId, generatedAvailabilities, isAutomatic);
    }
  }

  private async addAvailabilities(
    shopId: string,
    availabilities: DateRange[],
    isAutomatic = true,
  ) {
    if (availabilities.length === 0) return;

    // Base insert query
    const baseQuery =
      'INSERT INTO availability (shop_id, start_date_time, end_date_time, automatic) VALUES';

    // Creating the values placeholder for the SQL query
    const values = [];
    let placeholder = '';

    availabilities.forEach((availability, index) => {
      const offset = index * 4;
      placeholder += `($${1 + offset}, $${2 + offset}, $${3 + offset}, $${
        4 + offset
      }),`;

      values.push(
        shopId,
        availability.start_date_time,
        availability.end_date_time,
        isAutomatic,
      );
    });

    // Remove the last comma from the placeholder
    placeholder = placeholder.slice(0, -1);

    // Final query
    const finalQuery = `${baseQuery} ${placeholder}`;

    await this.db.query(finalQuery, values);
  }

  private getAvailabilitiesBasedOnDefaults(
    defaultAvailabilities: DefaultAvailability[],
    currentDay: Date,
  ) {
    return defaultAvailabilities.map((availability) => {
      const [startHour, startMinute] = availability.start_time.split(':');
      const [endHour, endMinute] = availability.end_time.split(':');

      return {
        start_date_time: DateTime.fromJSDate(currentDay)
          .set({
            hour: Number(startHour),
            minute: Number(startMinute),
          })
          .toJSDate(),
        end_date_time: DateTime.fromJSDate(currentDay)
          .set({
            hour: Number(endHour),
            minute: Number(endMinute),
          })
          .toJSDate(),
      };
    });
  }

  private getAvailabilitiesFilteredByUnavailabilities(
    availabilities: DateRange[],
    unavailabilities: DateRange[],
    min_appointment_time: number,
  ) {
    const filteredAvailabilities: DateRange[] = [];

    for (const availability of availabilities) {
      let isOverlapped = false;

      for (const unavailability of unavailabilities) {
        if (
          availability.start_date_time < unavailability.end_date_time &&
          availability.end_date_time > unavailability.start_date_time
        ) {
          isOverlapped = true;

          // Split availabilities based on unavailability
          if (availability.start_date_time < unavailability.start_date_time) {
            filteredAvailabilities.push({
              ...availability,
              end_date_time: unavailability.start_date_time,
            });
          }

          if (availability.end_date_time > unavailability.end_date_time) {
            filteredAvailabilities.push({
              ...availability,
              start_date_time: unavailability.end_date_time,
            });
          }
        }
      }

      if (!isOverlapped) {
        filteredAvailabilities.push(availability);
      }
    }

    // Filter out availabilities under min_appointment_time
    return filteredAvailabilities.filter((avail) => {
      const duration =
        (avail.end_date_time.getTime() - avail.start_date_time.getTime()) /
        (1000 * 60); // in minutes
      return duration >= min_appointment_time;
    });
  }
}
