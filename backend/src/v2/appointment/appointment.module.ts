import { Module } from '@nestjs/common';
import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';
import { AppointmentSchema } from './appointment.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProjectSchema } from 'src/entitiees/project.entity';
import { CustomerSchema } from 'src/entitiees/customer.entity';
import { ShopSchema } from 'src/entitiees/shop.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      AppointmentSchema,
      ProjectSchema,
      CustomerSchema,
      ShopSchema,
    ]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
})
export class AppointmentModule {}
