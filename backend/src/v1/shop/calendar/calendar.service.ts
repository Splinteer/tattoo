import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import {
  Availability,
  LinkedDateRange,
} from '../availability/availability.service';
import { Appointment } from 'src/v1/booking/booking.service';

export type AppointmentType =
  | 'Appointment'
  | 'paid_Appointment'
  | 'confirmed_Appointment'
  | 'proposal';

export type EventType = AppointmentType | 'Availability' | 'Unavailability';

export type BaseCalendarEvent = {
  id: string;
  shop_url: string;
  start_time: Date;
  end_time: Date;
  event_type: EventType;
  properties: { random?: string }; // fake empty object
};

export type AppointmentEvent = Omit<BaseCalendarEvent, 'event_type'> & {
  event_type: AppointmentType;
  properties: {
    project_id: string;
    is_paid: boolean;
  };
};

export type CalendarEvent = AppointmentEvent | BaseCalendarEvent;

export type CalendarEventGroupedByTimeInterval = CalendarEvent[];

export type CalendarEventGroupedByDay = {
  [day: string]: CalendarEventGroupedByTimeInterval[];
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
              CASE
                WHEN p.is_paid IS TRUE THEN 'paid_Appointment'
                  WHEN is_confirmed IS TRUE THEN 'confirmed_Appointment'
                  WHEN created_by_shop IS TRUE THEN 'proposal'
                  ELSE 'Appointment'
              END AS event_type,
              json_build_object('project_id', p.id, 'is_paid', p.is_paid) AS properties
          FROM
              public.appointment a
          INNER JOIN project p ON p.id=a.project_id
          INNER JOIN shop s ON p.shop_id=s.id AND s.url = $1
          INNER JOIN customer c ON c.id=p.customer_id
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
              'Availability' AS event_type,
        json_build_object() AS properties
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
              'Unavailability' AS event_type,
        json_build_object() AS properties
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

      -- Aggregate events for each time interval
      EventsAggregatedByInterval AS (
          SELECT
          	  d.day,
              e.start_time,
              e.end_time,
              COALESCE(
                  ARRAY_AGG(
                      json_build_object(
                          'id', e.id,
                          'shop_url', e.shop_url,
                          'start_time', e.start_time,
                          'end_time', e.end_time,
                          'event_type', e.event_type,
                          'properties', e.properties
                      )
                      ORDER BY start_time, end_time
                  ) FILTER (WHERE e.id IS NOT NULL),
                  ARRAY[]::json[]
              ) AS events
          FROM DateSeries d
          LEFT JOIN CombinedEvents e ON d.day = e.day
          GROUP BY d.day, e.start_time, e.end_time
      ),

      -- Aggregate events for each date
      EventsAggregatedByDay AS (
          SELECT
		       i.DAY,
           CASE
              WHEN COUNT(events) = 0 THEN '[]'
              ELSE JSON_AGG(events)
           END AS day_events

          FROM EventsAggregatedByInterval i
          GROUP BY i.day
      )

      -- Create the desired output format
      SELECT jsonb_object_agg(day, day_events) AS events
      FROM EventsAggregatedByDay
    `;

    const { rows } = await this.db.query<{ events: CalendarEventGroupedByDay }>(
      query,
      [shopUrl, startDate, endDate],
    );

    return rows[0].events;
  }

  public async getMinimumDateAvailability(shopUrl: string) {
    const { rows } = await this.db.query<{ date: string }>(
      `SELECT DATE(MIN(a.start_date_time)) as date
      FROM availability a
      INNER JOIN shop s ON s.id=a.shop_id
      WHERE a.start_date_time > NOW()
      AND s.url=$1`,
      [shopUrl],
    );

    return rows[0].date;
  }

  public async addAvailability(
    shopId: string,
    availability: Omit<CalendarEvent, 'id'>,
  ): Promise<Availability & LinkedDateRange> {
    const { rows } = await this.db.query<Availability & LinkedDateRange>(
      'INSERT INTO availability (shop_id, start_date_time, end_date_time, automatic) VALUES ($1, $2, $3, FALSE) RETURNING *',
      [shopId, availability.start_time, availability.end_time],
    );

    return rows[0];
  }

  public async updateAvailability(
    availability: CalendarEvent,
  ): Promise<Availability & LinkedDateRange> {
    const { rows } = await this.db.query<Availability & LinkedDateRange>(
      'UPDATE availability SET start_date_time=$2, end_date_time=$3, automatic=FALSE WHERE id = $1 RETURNING *',
      [availability.id, availability.start_time, availability.end_time],
    );

    return rows[0];
  }

  public async deleteAvailability(id: string) {
    const { rows } = await this.db.query<Availability & LinkedDateRange>(
      'DELETE FROM availability WHERE id=$1 RETURNING *',
      [id],
    );

    return rows[0];
  }

  public async addUnavailability(
    shopId: string,
    unavailability: Omit<CalendarEvent, 'id'>,
  ): Promise<Availability & LinkedDateRange> {
    const { rows } = await this.db.query<Availability & LinkedDateRange>(
      'INSERT INTO unavailability (shop_id, start_date_time, end_date_time) VALUES ($1, $2, $3) RETURNING *',
      [shopId, unavailability.start_time, unavailability.end_time],
    );

    return rows[0];
  }

  public async updateUnavailability(
    unavailability: CalendarEvent,
  ): Promise<LinkedDateRange> {
    const { rows } = await this.db.query<LinkedDateRange>(
      'UPDATE unavailability SET start_date_time=$2, end_date_time=$3 WHERE id = $1 RETURNING *',
      [unavailability.id, unavailability.start_time, unavailability.end_time],
    );

    return rows[0];
  }

  public async deleteUnavailability(id: string) {
    const { rows } = await this.db.query<LinkedDateRange>(
      'DELETE FROM unavailability WHERE id=$1 RETURNING *',
      [id],
    );
    return rows[0];
  }

  public async deletePastUnconfirmedAppointments() {
    await this.db.begin();
    try {
      const appointmentQuery = 'is_confirmed IS FALSE AND start_date < NOW()';
      await this.db.query(
        `DELETE FROM chat_event_appointment_new WHERE appointment_id IN (SELECT id FROM appointment WHERE ${appointmentQuery})`,
      );
      await this.db.query(`DELETE FROM appointment WHERE ${appointmentQuery}`);
      await this.db.commit();
    } catch (error) {
      await this.db.rollback();

      throw error;
    }
  }

  public async deletePastAvailability() {
    await this.db.query(
      'DELETE FROM availability WHERE start_date_time < NOW()',
    );
  }

  public async addProposal(
    shop_url: string,
    projectId: string,
    startTime: string,
    endTime: string,
  ): Promise<AppointmentEvent> {
    const {
      rows: [appointment],
    } = await this.db.query<Appointment>(
      'INSERT INTO appointment (project_id, start_date, end_date, created_by_shop) VALUES ($1, $2, $3, TRUE) RETURNING *',
      [projectId, startTime, endTime],
    );

    return {
      id: appointment.id,
      shop_url,
      event_type: 'proposal',
      start_time: appointment.start_date,
      end_time: appointment.end_date,
      properties: {
        project_id: projectId,
        is_paid: false,
      },
    };
  }
}
