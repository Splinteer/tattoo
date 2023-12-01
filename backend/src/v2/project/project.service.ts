import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { ProjectSchema } from './project.entity';
import { Repository, SelectQueryBuilder } from 'typeorm';
import {
  ProjectAttachmentSchema,
  ProjectAttachmentType,
} from './project-attachment.entity';
import { StorageService } from '@app/common/storage/storage.service';
import { AppointmentService } from '../appointment/appointment.service';
import { ProjectRole } from './project.interface';
import { ChatEventSchema, ChatEventType } from './event/event.entity';
import { CustomerSchema } from 'src/entitiees/customer.entity';
import { EntityMapperService } from '@app/common/entity-mapper/entity-mapper.service';
import { ShopSchema } from 'src/entitiees/shop.entity';
import { ChatEventMessageSchema } from './event/entity/event-types.entity';
import { ChatEvent } from './event/event.service';
import {
  CustomerConversation,
  ShopConversation,
} from './conversation.interface';

type ChatLastMessageEvent = {
  senderId: string;
  creationDate: Date;
  type: ChatEventType.MESSAGE;
  content: string;
  isRead: true;
};

export type ChatLastEvent =
  | ChatLastMessageEvent
  | (Omit<ChatLastMessageEvent, 'content'> & {
      type: Exclude<ChatEventType, ChatEventType.MESSAGE>;
    });

export type CustomerChat = {
  project: ProjectSchema;
  shop: ShopSchema;
  lastEvent: ChatLastEvent;
  events?: ChatEvent[];
};

export type ShopChat = {
  project: ProjectSchema;
  customer: CustomerSchema;
  lastEvent: ChatLastEvent;
  events?: ChatEvent[];
};

@Injectable()
export class ProjectService {
  constructor(
    @InjectRepository(ProjectSchema)
    private readonly projectRepository: Repository<ProjectSchema>,

    @InjectRepository(ChatEventSchema)
    private readonly eventRepository: Repository<ChatEventSchema>,

    @Inject('public') private readonly publicStorage: StorageService,
    private readonly appointmentService: AppointmentService,
    private readonly entityMapper: EntityMapperService,
  ) {}

  #getAllQuery(lastFetchedDate?: string) {
    const query = this.projectRepository
      .createQueryBuilder('p')
      .select([
        'row_to_json(p.*) as project',
        `
          json_strip_nulls(
            json_build_object(
              'senderId', ce.sender_id,
              'creationDate', ce.creation_date,
              'type', ce.type,
              'content', ce.content,
              'isRead', ce.is_read
            )
          ) AS last_event
        `,
      ])
      .innerJoin(
        (qb) =>
          qb
            .from(ChatEventSchema, 'last_event_date')
            .select('MAX(last_event_date.creationDate)', 'max_date')
            .addSelect('last_event_date.project_id', 'project_id')
            .groupBy('last_event_date.project_id'),
        'last_event_date',
        'last_event_date.project_id = p.id',
      )
      .innerJoin(
        (db) =>
          db
            .from(ChatEventSchema, 'ce')
            .leftJoin(
              ChatEventMessageSchema,
              'message',
              'message.event_id = ce.id',
            ),
        'ce',
        'ce.project_id = p.id AND ce.creation_date = last_event_date.max_date',
      )
      .groupBy(
        'p.id, ce.project_id, ce.content, ce.type, ce.creation_date, ce.is_read, ce.sender_id, last_event_date.max_date',
      )
      .orderBy('p.updatedAt', 'DESC');

    if (lastFetchedDate) {
      query.andWhere('ce.creation_date < :lastFetchedDate', {
        lastFetchedDate,
      });
    }

    return query;
  }

  async getAllByCustomer(
    customerId: string,
    lastFetchedDate?: string,
  ): Promise<CustomerConversation[]> {
    const query: SelectQueryBuilder<ProjectSchema> = this.#getAllQuery(
      lastFetchedDate,
    )
      .addSelect('row_to_json(shop.*) as shop')
      .innerJoin(ShopSchema, 'shop', 'shop.id = p.shopId')
      .addGroupBy('shop.id')
      .where('p.customerId = :customerId', { customerId })
      .limit(10);

    const result = await query.getRawMany();

    return result.map((row) => {
      return {
        type: 'customer',
        project: this.entityMapper.mapEntity<ProjectSchema>(
          row.project,
          ProjectSchema,
        ),
        shop: this.entityMapper.mapEntity<ShopSchema>(row.shop, ShopSchema),
        lastEvent: row.last_event as ChatLastEvent,
        events: [],
      };
    });
  }

  async getAllByShop(
    shopUrl: string,
    lastFetchedDate: string,
  ): Promise<ShopConversation[]> {
    const query: SelectQueryBuilder<ProjectSchema> = this.#getAllQuery(
      lastFetchedDate,
    )
      .addSelect('row_to_json(customer.*) as customer')
      .innerJoin(CustomerSchema, 'customer', 'customer.id = p.customerId')
      .innerJoin(ShopSchema, 'shop', 'shop.id = p.shopId')
      .addGroupBy('customer.id')
      .andWhere('shop.url = :shopUrl', { shopUrl })
      .limit(10);

    const result = await query.getRawMany();
    return result.map((row) => {
      return {
        ...row,
        type: 'shop',
        project: this.entityMapper.mapEntity<ProjectSchema>(
          row.project,
          ProjectSchema,
        ),
        customer: this.entityMapper.mapEntity<CustomerSchema>(
          row.customer,
          CustomerSchema,
        ),
        lastEvent: row.last_event as ChatLastEvent,
        events: [],
      };
    });
  }

  // #mapProjectDbToProject(originalProject: Record<string, any>): ProjectSchema {
  //   const project = new ProjectSchema();

  //   const metadata = this.projectRepository
  //     .createQueryBuilder()
  //     .connection.getMetadata(ProjectSchema);

  //   metadata.columns.forEach((column) => {
  //     project[column.propertyName] = originalProject[column.databaseName];
  //   });

  //   return project;
  // }

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

  canAccess(
    project: { customerId: string; shopId: string },
    customerId: string,
    shopId?: string,
  ): ProjectRole {
    if (project.customerId === customerId) {
      return ProjectRole.CUSTOMER;
    }

    if (project.shopId === shopId) {
      return ProjectRole.SHOP;
    }

    return ProjectRole.UNAUTHORISED;
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
