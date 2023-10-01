import { Module } from '@nestjs/common';
import { ProjectAppointmentController } from './project-appointment.controller';
import { AppointmentModule } from 'src/v2/appointment/appointment.module';

@Module({
  imports: [AppointmentModule],
  controllers: [ProjectAppointmentController],
})
export class ProjectAppointmentModule {}
