import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';
import { Flash } from 'src/flash/flash.service';
import { AppointmentEvent } from 'src/shop/calendar/calendar.service';
import { ProjectPatchBodyDTO } from './project.dto';

export type ProjectType = 'flashs' | 'custom' | 'adjustment';

export type Project = {
  id: string;
  customer_id: string;
  shop_id: string;
  name: string;
  types: ProjectType[];
  is_first_tattoo: boolean;
  is_cover_up: boolean;
  is_post_operation_or_over_scar: boolean;
  zone: string;
  height_cm: number;
  width_cm: number;
  additional_information?: string;
  is_paid: boolean;
  planned_date?: string;
  customer_availability?: string;
  customer_rating?: number;
  shop_rating?: number;
  flashs?: Flash[];
  illustrations?: string[];
  locations?: string[];
  attachments?: string[];
  appointments?: AppointmentEvent[];
};

@Injectable()
export class ProjectService {
  constructor(
    private readonly db: DbService,
    @Inject('public') private readonly publicStorage: StorageService,
  ) {}

  async get(projectId: string) {
    const query = `--sql
      WITH project_attachments AS (
        SELECT
            project_id,
            CASE
                WHEN type = 'illustration' THEN image_url
                ELSE NULL
            END AS illustration,
            CASE
                WHEN type = 'location' THEN image_url
                ELSE NULL
            END AS location
        FROM public.project_attachment
        WHERE project_id = $1
      ),

      project_flashs as (
        SELECT f.*, shop.url as shop_url, pf.project_id
        FROM flash f
        INNER JOIN shop ON shop.id=f.shop_id
        INNER JOIN project_flash pf ON pf.flash_id=f.id
        WHERE pf.project_id = $1
      ),

      project_medias AS (
      	SELECT content as image_url, c.project_id
      	FROM chat_event ce
		    INNER JOIN chat c ON c.id=ce.chat_id
        WHERE c.project_id = $1
        AND ce.type = 'media'
		  ),

      confirmed_appointment AS (
        SELECT start_date AS planned_date
        FROM appointment
        WHERE project_id = $1 AND is_confirmed = true
        LIMIT 1
      )

      SELECT
          p.id,
          p.customer_id,
          p.shop_id,
          p.name,
          p.types::varchar[] as types,
          p.is_first_tattoo,
          p.is_cover_up,
          p.is_post_operation_or_over_scar,
          p.zone,
          p.height_cm,
          p.width_cm,
          p.additional_information,
          P.customer_availability,
          p.is_paid,
          (SELECT planned_date FROM confirmed_appointment) AS planned_date,
          p.customer_rating,
          p.shop_rating,
          jsonb_agg(DISTINCT pf) FILTER (WHERE pf.id IS NOT NULL) AS flashs,
          ARRAY_AGG(DISTINCT pa.illustration ) FILTER (WHERE pa.illustration IS NOT NULL) AS illustrations,
          ARRAY_AGG(DISTINCT pa.location ) FILTER (WHERE pa.location IS NOT NULL) AS locations,
          ARRAY_AGG(DISTINCT pm.image_url ) FILTER (WHERE pm.image_url IS NOT NULL) AS attachments
      FROM public.project p
      LEFT JOIN project_flashs pf ON p.id = pf.project_id
      LEFT JOIN project_attachments pa ON p.id = pa.project_id
      LEFT JOIN project_medias pm ON p.id = pm.project_id
      WHERE p.id = $1
      GROUP BY p.id;
    `;

    const {
      rows: [project],
    } = await this.db.query<Project>(query, [projectId]);

    project.appointments = await this.getAppointments(projectId);

    return this.getProjectSignedUrls(project);
  }

  async getAppointments(projectId: string) {
    const query = `--sql
			SELECT
          a.id,
          p.id AS project_id,
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
      INNER JOIN shop s ON p.shop_id=s.id
      INNER JOIN customer c ON c.id=p.customer_id
      WHERE p.id = $1
    `;

    const { rows: appointments } = await this.db.query<AppointmentEvent>(
      query,
      [projectId],
    );

    return appointments;
  }

  async getProjectSignedUrls(project: Project) {
    if (!project) {
      return;
    }

    if (project.attachments?.length) {
      project.attachments = await Promise.all(
        project.attachments.map((attachment) =>
          this.publicStorage.getSignedUrl(attachment),
        ),
      );
    }

    if (project.illustrations?.length) {
      project.illustrations = await Promise.all(
        project.illustrations.map((attachment) =>
          this.publicStorage.getSignedUrl(attachment),
        ),
      );
    }

    if (project.locations?.length) {
      project.locations = await Promise.all(
        project.locations.map((attachment) =>
          this.publicStorage.getSignedUrl(attachment),
        ),
      );
    }

    return project;
  }

  async update(projectId: string, fields: ProjectPatchBodyDTO) {
    if (Object.keys(fields).length === 0) {
      return;
    }

    const setClauses: string[] = [];
    const values: any[] = [projectId];

    for (const [key, value] of Object.entries(fields)) {
      values.push(value);
      setClauses.push(`${key} = $${values.length}`);
    }

    const updateQuery = `
      UPDATE public.project
      SET ${setClauses.join(', ')}
      WHERE id = $1
    `;

    await this.db.query(updateQuery, values);
  }
}
