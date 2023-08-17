import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

export enum Weekday {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

export interface HourRange {
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  startDay: Weekday;
  endDay: Weekday;
  hourRanges: HourRange[];
}

export interface DefaultAvailability {
  shop_id: string;
  start_day: string;
  end_day: string;
  start_time: string;
  end_time: string;
}

export interface DayGroupedDefaultAvailability {
  startDay: Weekday;
  endDay: Weekday;
  hourRanges: {
    startTime: string;
    endTime: string;
  }[];
}

@Injectable()
export class DefaultAvailabilityService {
  constructor(private readonly db: DbService) {}

  public async get(shopId: string): Promise<DayGroupedDefaultAvailability[]> {
    const { rows } = await this.db.query<DayGroupedDefaultAvailability>(
      `SELECT
          start_day AS "startDay",
          end_day AS "endDay",
          ARRAY_AGG(
            JSON_BUILD_OBJECT('startTime', start_time, 'endTime', end_time)
            ORDER BY start_time
          ) AS "hourRanges"
        FROM default_availability
        WHERE shop_id = $1
        GROUP BY start_day, end_day`,
      [shopId],
    );

    return rows;
  }

  public async update(shopId: string, availabilities: DayAvailability[]) {
    await this.db.begin();
    try {
      await this.deleteAll(shopId);

      if (availabilities.length) {
        const defaultAvailabilities = this.formatBody(shopId, availabilities);

        await this.insertAll(defaultAvailabilities);
      }

      await this.db.commit();
    } catch (error) {
      await this.db.rollback();
      throw error;
    }
  }

  private async deleteAll(shopId: string) {
    const deleteQuery = `
          DELETE FROM default_availability
          WHERE shop_id = $1;
      `;
    await this.db.query(deleteQuery, [shopId]);
  }

  private formatBody(
    shopId: string,
    availabilities: DayAvailability[],
  ): DefaultAvailability[] {
    console.log(availabilities);
    return availabilities.reduce((acc, dayAvailability) => {
      const dayValues = dayAvailability.hourRanges.map((hourRange) => [
        shopId,
        dayAvailability.startDay,
        dayAvailability.endDay,
        hourRange.startTime,
        hourRange.endTime,
      ]);
      return [...acc, ...dayValues];
    }, []);
  }

  private async insertAll(defaultAvailabilities: DefaultAvailability[]) {
    const step = Object.keys(defaultAvailabilities[0]).length;
    let offset = -step;

    // const rows = Array(defaultAvailabilities.length)
    //   .fill(null)
    //   .map(() => {
    //     offset += step;
    //     return
    //     return `($${offset}, $${offset + 1}, $${offset + 2}, $${offset + 3}, $${
    //       offset + 4
    //     })`;
    //   });

    const rows = defaultAvailabilities.map((availability) => {
      offset += step;
      return `(${Object.keys(availability)
        .map((v, index: number) => `$${offset + index + 1}`)
        .join(',')})`;
    });

    const insertQuery = `
      INSERT INTO default_availability (shop_id, start_day, end_day, start_time, end_time)
      VALUES ${rows.join(', ')}
      `;
    console.log(rows);
    console.log(insertQuery, defaultAvailabilities.flat());

    await this.db.query(insertQuery, defaultAvailabilities.flat());
  }
}
