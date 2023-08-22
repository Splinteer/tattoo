import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';

type EventType = 'Appointment' | 'Availability' | 'Unavailability';

type Event = {
  id: string;
  shop_url: string;
  start_time: Date;
  end_time: Date;
  event_type: EventType;
};

export type CalendarEventGroupedByDay = {
  [day: string]: Event[];
};

@Injectable()
export class CalendarService {
  constructor(private readonly db: DbService) {}

  async getEvents(
    shopUrl: string,
    startDate: string | Date,
    endDate: string | Date,
  ) {
    const query = `
      WITH DateSeries AS (
          SELECT generate_series($2, $3, interval '1 day')::date as day
      ),

      -- Fetching Appointments
      Appointments AS (
          SELECT
              a.id,
              url as shop_url,
              start_date::date AS day,
              start_date AS start_time,
              COALESCE(end_date, start_date) AS end_time,
              'Appointment' AS event_type
          FROM
              public.appointment a
          INNER JOIN project p ON p.id=a.project_id
          INNER JOIN shop s ON p.shop_id=s.id AND s.url = $1
          WHERE start_date BETWEEN $2 AND $3
      ),

      -- Fetching Availabilities
      Availabilities AS (
          SELECT
              a.id,
              url as shop_url,
              start_date_time::date AS day,
              start_date_time AS start_time,
              end_date_time AS end_time,
              'Availability' AS event_type
          FROM
              public.availability a
          INNER JOIN shop s ON s.id=a.shop_id AND s.url = $1
          WHERE start_date_time BETWEEN $2 AND $3
      ),

      -- Fetching Unavailabilities
      Unavailabilities AS (
          SELECT
              u.id,
              url as shop_url,
              start_date_time::date AS day,
              start_date_time AS start_time,
              end_date_time AS end_time,
              'Unavailability' AS event_type
          FROM
              public.unavailability u
          INNER JOIN shop s ON s.id=u.shop_id AND s.url = $1
          WHERE start_date_time BETWEEN $2 AND $3
      ),

      -- Combine all events
      CombinedEvents AS (
          SELECT * FROM Appointments
          UNION ALL
          SELECT * FROM Availabilities
          UNION ALL
          SELECT * FROM Unavailabilities
      ),

      -- Aggregate events for each date
      EventsAggregated AS (
          SELECT
              d.day,
              COALESCE(
                  ARRAY_AGG(
                      json_build_object(
                          'id', e.id,
                          'shop_url', e.shop_url,
                          'start_time', e.start_time,
                          'end_time', e.end_time,
                          'event_type', e.event_type
                      )
                      ORDER BY start_time, end_time
                  ) FILTER (WHERE e.id IS NOT NULL),
                  ARRAY[]::json[]
              ) AS day_events
          FROM DateSeries d
          LEFT JOIN CombinedEvents e ON d.day = e.day
          GROUP BY d.day
      )

      -- Create the desired output format
      SELECT jsonb_object_agg(day, day_events) AS events
      FROM EventsAggregated;
    `;

    const { rows } = await this.db.query<{ events: CalendarEventGroupedByDay }>(
      query,
      [shopUrl, startDate, endDate],
    );

    return rows[0].events;
  }
}
