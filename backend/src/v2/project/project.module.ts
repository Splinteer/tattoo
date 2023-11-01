import { Module } from '@nestjs/common';
import { ProjectController } from './project.controller';
import { ProjectService } from './project.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomerSchema } from 'src/entitiees/customer.entity';
import { ShopSchema } from 'src/entitiees/shop.entity';
import { ProjectSchema } from './project.entity';
import { ProjectFlashSchema } from './project-flash/project-flash.entity';
import { ProjectFlashModule } from './project-flash/project-flash.module';
import { ProjectAttachmentSchema } from './project-attachment.entity';
import { CommonModule } from '@app/common';
import { AppointmentModule } from '../appointment/appointment.module';
import { AppointmentSchema } from '../appointment/appointment.entity';
import { ProjectAppointmentController } from './project-appointment/project-appointment.controller';
import { ShopModule } from 'src/v1/shop/shop.module';
import { EventController } from './event/event.controller';
import { EventService } from './event/event.service';
import {
  ChatEventAppointmentNewSchema,
  ChatEventMediaSchema,
  ChatEventMessageSchema,
} from './event/entity/event-types.entity';
import { ChatEventSchema } from './event/event.entity';
import { EventNotificationService } from './event/notification/notification.service';

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

      // Events
      ChatEventSchema,
      ChatEventAppointmentNewSchema,
      ChatEventMediaSchema,
      ChatEventMessageSchema,
    ]),
    ProjectFlashModule,
    ShopModule,
  ],
  controllers: [
    ProjectController,
    ProjectAppointmentController,
    EventController,
  ],
  providers: [ProjectService, EventService, EventNotificationService],
})
export class ProjectModule {}
