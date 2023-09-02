import { DbService } from '@app/common/db/db.service';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject, Injectable } from '@nestjs/common';

export interface CreateBookingInput {
  name: string;
  types: string[];
  is_first_tattoo: boolean;
  is_cover_up: boolean;
  is_post_operation_or_over_scar: boolean;
  zone: string;
  height_cm: number;
  width_cm: number;
  additional_information?: string;
}

type Project = {
  id: string;
  customer_id: string;
  shop_id: string;
  name: string;
  types: string[]; // Assuming project_type is represented as string in TypeScript
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
      additional_information,
    } = bookingData;

    const {
      rows: [project],
    } = await this.db.query<Project>(
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
        additional_information
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *;`,
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
        additional_information,
      ],
    );

    return project;
  }

  public async addFlashToProject(
    projectId: string,
    flashId: string,
  ): Promise<void> {
    const query = `
      INSERT INTO public.project_flash (project_id, flash_id)
      VALUES ($1, $2) RETURNING *;
    `;

    await this.db.query(query, [projectId, flashId]);
  }

  public async createChatForProject(projectId: string) {
    const query = `
      INSERT INTO public.chat (project_id)
      VALUES ($1) RETURNING *;
    `;

    const {
      rows: [chat],
    } = await this.db.query<{
      id: string;
      project_id: string;
      creation_date: Date;
    }>(query, [projectId]);

    return chat;
  }

  public async createAppointments(projectId: string, availabilities: string[]) {
    const query = `
      INSERT INTO public.appointment (project_id, start_date, end_date)
      SELECT $1, start_date_time, end_date_time
      FROM public.availability
      WHERE id = ANY($2)
      RETURNING *;
    `;

    const { rows: appointments } = await this.db.query<Appointment>(query, [
      projectId,
      availabilities,
    ]);

    return appointments;
  }
}
