import { Injectable } from '@nestjs/common';
import { Repository } from 'typeorm';
import { AppointmentSchema } from './appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentSchema)
    private appointmentRepository: Repository<AppointmentSchema>,
  ) {}

  async getAll(customerId: string) {
    return this.appointmentRepository.find({
      where: {
        project: {
          customer: {
            id: customerId,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return this.appointmentRepository.findOne({
      relations: ['project'],
      where: {
        id,
      },
    });
  }

  async delete(id: string) {
    return this.appointmentRepository.delete(id);
  }
}
