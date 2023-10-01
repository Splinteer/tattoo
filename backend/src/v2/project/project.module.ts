import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSchema } from 'src/entitiees/customer.entity';
import { ShopSchema } from 'src/entitiees/shop.entity';
import { ProjectSchema } from './project.entity';
import { ProjectFlashSchema } from './project-flash/project-flash.entity';
import { ProjectAppointmentModule } from './project-appointment/project-appointment.module';
import { ProjectFlashModule } from './project-flash/project-flash.module';
import { ProjectAttachmentSchema } from './project-attachment.entity';
import { CommonModule } from '@app/common';
import { AppointmentModule } from '../appointment/appointment.module';
import { AppointmentSchema } from '../appointment/appointment.entity';

@Module({
  imports: [
    CommonModule,
    AppointmentModule,
    TypeOrmModule.forFeature([
      ProjectSchema,
      CustomerSchema,
      ShopSchema,
      ProjectAttachmentSchema,
      ProjectFlashSchema,
      AppointmentSchema,
    ]),
    ProjectAppointmentModule,
    ProjectFlashModule,
  ],
  controllers: [ProjectController],
  providers: [ProjectService],
})
export class ProjectModule {}
