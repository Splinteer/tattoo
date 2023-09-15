import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';
import { PoolClient } from 'pg';
import { ProjectType } from 'src/project/project.service';

export interface CreateBookingInput {
  name: string;
  types: ProjectType[];
  is_first_tattoo: boolean;
  is_cover_up: boolean;
  is_post_operation_or_over_scar: boolean;
  zone: string;
  height_cm: number;
  width_cm: number;
  customer_availability?: string;
  additional_information?: string;
}

type Project = {
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
  additional_information?: string; // Optional since it can be NULL
  is_drawing_done: boolean;
  is_drawing_approved: boolean;
  is_paid: boolean;
  customer_rating?: number; // Optional since it can be NULL
  shop_rating?: number; // Optional since it can be NULL
};

type Appointment = {
  project_id: string;
  creation_date: Date;
  start_date: Date;
  end_date: Date;
  is_confirmed: boolean;
};

export type ProjectAttachmentType = 'illustration' | 'location';

export type ProjectAttachment = {
  project_id: string;
  image_url: string;
  type: ProjectAttachmentType;
};

@Injectable()
export class BookingService {
  constructor(
    @Inject('public') private readonly publicStorage: StorageService,
    private readonly db: DbService,
  ) {}

  async createProject(
    customerId: string,
    shopId: string,
    bookingData: CreateBookingInput,
    client?: PoolClient,
  ) {
    const {
      name,
      types,
      is_first_tattoo,
      is_cover_up,
      is_post_operation_or_over_scar,
      zone,
      height_cm,
      width_cm,
      customer_availability,
      additional_information,
    } = bookingData;

    const {
      rows: [project],
    } = await (client || this.db).query<Project>(
      `INSERT INTO public.project (
        customer_id,
        shop_id,
        name,
        types,
        is_first_tattoo,
        is_cover_up,
        is_post_operation_or_over_scar,
        zone,
        height_cm,
        width_cm,
        customer_availability,
        additional_information
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12) RETURNING *;`,
      [
        customerId,
        shopId,
        name,
        types,
        is_first_tattoo,
        is_cover_up,
        is_post_operation_or_over_scar,
        zone,
        height_cm,
        width_cm,
        customer_availability,
        additional_information,
      ],
    );

    return project;
  }

  public async addFlashToProject(
    projectId: string,
    flashId: string,
    client?: PoolClient,
  ): Promise<void> {
    const query = `
      INSERT INTO public.project_flash (project_id, flash_id)
      VALUES ($1, $2) RETURNING *;
    `;

    await (client || this.db).query(query, [projectId, flashId]);
  }

  public async createChatForProject(projectId: string, client?: PoolClient) {
    const query = `
      INSERT INTO public.chat (project_id)
      VALUES ($1) RETURNING *;
    `;

    const {
      rows: [chat],
    } = await (client || this.db).query<{
      id: string;
      project_id: string;
      creation_date: Date;
    }>(query, [projectId]);

    return chat;
  }

  public async createAppointments(
    projectId: string,
    availabilities: string[],
    client?: PoolClient,
  ): Promise<Appointment[]> {
    const query = `
      INSERT INTO public.appointment (project_id, start_date, end_date)
      SELECT $1, start_date_time, end_date_time
      FROM public.availability
      WHERE id = ANY($2)
      RETURNING *;
    `;

    const { rows: appointments } = await (client || this.db).query<Appointment>(
      query,
      [projectId, availabilities],
    );

    return appointments;
  }

  public async generateBill(
    projectId: string,
    client?: PoolClient,
  ): Promise<void> {
    const query = `
      INSERT INTO public.bill (
        project_id,
        customer_id,
        firstname,
        lastname,
        address,
        address2,
        city,
        zipcode
      )
      SELECT
        p.id,
        c.id,
        c.firstname,
        c.lastname,
        c.address,
        c.address2,
        c.city,
        c.zipcode
      FROM public.project p
      INNER JOIN customer c ON c.id=p.customer_id
      WHERE p.id = $1;
    `;

    await (client || this.db).query(query, [projectId]);
  }

  public async addAttachments(
    projectId: string,
    attachments: Express.Multer.File[],
    type: ProjectAttachmentType,
    client?: PoolClient,
  ): Promise<ProjectAttachment[]> {
    return Promise.all(
      attachments.map(async (attachment) => {
        const attachmentId = DbService.getUUID();
        const path = `projects/${projectId}/${type}/${attachmentId}`;

        await this.publicStorage.save(path, attachment, { public: false });

        const query = `
          INSERT INTO public.project_attachment (project_id, image_url, type)
          VALUES($1, $2, $3)
          RETURNING *;
        `;

        const {
          rows: [newAttachment],
        } = await (client || this.db).query<ProjectAttachment>(query, [
          projectId,
          path,
          type,
        ]);

        return newAttachment;
      }),
    );
  }
}
