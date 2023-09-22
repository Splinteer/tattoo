import { DbService } from '@app/common/db/db.service';
import { Injectable } from '@nestjs/common';
import { Appointment } from 'src/v1/booking/booking.service';

@Injectable()
export class AppointmentService {
  constructor(private readonly db: DbService) {}

  async accept(appointmentId: string) {
    const {
      rows: [appointment],
    } = await this.db.query<Appointment>(
      `--sql
        UPDATE appointment SET is_confirmed=TRUE WHERE id=$1 RETURNING *
      `,
      [appointmentId],
    );

    return appointment;
  }

  async removeUnconfirmed(projectId: string) {
    await this.db.query(
      `--sql
        DELETE FROM appointment WHERE is_confirmed=FALSE AND project_id=$1;
      `,
      [projectId],
    );
  }
}
