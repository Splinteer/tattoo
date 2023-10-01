import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectSchema } from './project.entity';
import { Repository } from 'typeorm';
import {
  ProjectAttachmentSchema,
  ProjectAttachmentType,
} from './project-attachment.entity';
import { StorageService } from '@app/common/storage/storage.service';
import { AppointmentService } from '../appointment/appointment.service';

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectSchema)
    private readonly projectRepository: Repository<ProjectSchema>,
    @Inject('public') private readonly publicStorage: StorageService,
    private readonly appointmentService: AppointmentService,
  ) {}

  async getById(id: string) {
    const rawProject = await this.projectRepository.findOne({
      where: { id },
      relations: ['flashs', 'attachments'],
    });

    return {
      ...rawProject,
      illustrations: await this.attachmentsToSignedUrls(
        rawProject.attachments,
        ProjectAttachmentType.ILLUSTRATION,
      ),
      locations: await this.attachmentsToSignedUrls(
        rawProject.attachments,
        ProjectAttachmentType.LOCATION,
      ),
      appointments: await this.appointmentService.getCalendarEventsByProject(
        rawProject.id,
      ),
      attachments: [], // TODO chats medias
    };
  }

  async attachmentsToSignedUrls(
    attachments: ProjectAttachmentSchema[],
    type: ProjectAttachmentType,
  ) {
    return await Promise.all(
      attachments
        .filter((attachment) => attachment.type === type)
        .map((attachment) =>
          this.publicStorage.getSignedUrl(attachment.imageUrl),
        ),
    );
  }

  async canAccess(
    project: { customerId: string; shopId: string },
    customerId: string,
    shopId?: string,
  ) {
    if (project.customerId === customerId) {
      return 'customer';
    }

    if (project.shopId === shopId) {
      return 'shop';
    }

    return 'unauthorised';
  }

  async setPaid(id: string) {
    await this.projectRepository.update({ id }, { isPaid: true });
  }

  async setCustomerRating(id: string, rating: number) {
    await this.projectRepository.update({ id }, { customerRating: rating });
  }

  async setShopRating(id: string, rating: number) {
    await this.projectRepository.update({ id }, { shopRating: rating });
  }
}
