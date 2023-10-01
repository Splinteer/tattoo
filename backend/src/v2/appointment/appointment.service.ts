import { Injectable } from '@nestjs/common';
import { FindManyOptions, Repository } from 'typeorm';
import { AppointmentSchema } from './appointment.entity';
import { InjectRepository } from '@nestjs/typeorm';

export enum AppointmentStatus {
  PAID = 'appointment_paid',
  CONFIRMED = 'appointment_confirmed',
  PROPOSAL = 'appointment_proposal',
  UNCONFIRMED = 'appointment_unconfirmed',
}

export type CalendarEvent = {
  id: string;
  projectId: string;
  type: AppointmentStatus;
  shopUrl: string;
  startTime: Date;
  endTime: Date;
};

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(AppointmentSchema)
    private appointmentRepository: Repository<AppointmentSchema>,
  ) {}

  async getById(id: string) {
    return this.appointmentRepository.findOne({
      where: { id },
      relations: ['project'],
    });
  }

  async delete(id: string) {
    return this.appointmentRepository.delete(id);
  }

  // Calendar Events

  async getCalendarEventsByCustomer(customerId: string) {
    return this.#getCalendarEventsBy({
      project: {
        customer: {
          id: customerId,
        },
      },
    });
  }

  async getCalendarEventsByProject(projectId: string) {
    return this.#getCalendarEventsBy({
      projectId,
    });
  }

  async #getCalendarEventsBy(
    where: FindManyOptions<AppointmentSchema>['where'],
  ): Promise<CalendarEvent[]> {
    const appointments = await this.appointmentRepository.find({
      where,
      relations: ['project', 'project.shop'],
    });

    return appointments.map((appointment) =>
      this.#toCalendarEvent(appointment),
    );
  }

  async #getOneCalendarEventBy(
    where: FindManyOptions<AppointmentSchema>['where'],
  ): Promise<CalendarEvent> {
    const appointment = await this.appointmentRepository.findOne({
      where,
      relations: ['project'],
    });

    return this.#toCalendarEvent(appointment);
  }

  #toCalendarEvent(appointment: AppointmentSchema): CalendarEvent {
    return {
      id: appointment.id,
      projectId: appointment.project.id,
      type: this.#getEventType(appointment),
      shopUrl: appointment.project.shop.url,
      startTime: appointment.startDate,
      endTime: appointment.endDate,
    };
  }

  #getEventType(appointment: AppointmentSchema): AppointmentStatus {
    if (appointment.project.isPaid) return AppointmentStatus.PAID;
    if (appointment.isConfirmed) return AppointmentStatus.CONFIRMED;
    if (appointment.createdByShop) return AppointmentStatus.PROPOSAL;

    return AppointmentStatus.UNCONFIRMED;
  }
}
