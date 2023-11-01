import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { CustomerSchema } from '../../entitiees/customer.entity';
import { ShopSchema } from '../../entitiees/shop.entity';
import { AppointmentSchema } from '../appointment/appointment.entity';
import { FlashSchema } from '../flash/flash.entity';
import { ProjectAttachmentSchema } from './project-attachment.entity';
import { ChatEventSchema } from './event/event.entity';

export enum ProjectType {
  FLASHS = 'flashs',
  CUSTOM = 'custom',
  ADJUSTMENT = 'adjustment',
}

@Entity('project')
export class ProjectSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => ProjectAttachmentSchema, (attachment) => attachment.project)
  attachments: ProjectAttachmentSchema[];

  @ManyToMany(() => FlashSchema, (flash) => flash.projects)
  @JoinTable({
    name: 'project_flash',
    joinColumn: {
      name: 'project_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'flash_id',
      referencedColumnName: 'id',
    },
  })
  flashs: FlashSchema[];

  @OneToMany(() => AppointmentSchema, (appointments) => appointments.project)
  appointments: AppointmentSchema[];

  @ManyToOne(() => CustomerSchema)
  @JoinColumn({ name: 'customer_id' })
  customer: CustomerSchema;

  @Column({ name: 'customer_id', type: 'uuid' })
  customerId: string;

  @ManyToOne(() => ShopSchema)
  @JoinColumn({ name: 'shop_id' })
  shop: ShopSchema;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({
    name: 'created_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  createdAt: Date;

  @Column({
    name: 'updated_at',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  updatedAt: Date;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column('enum', { enum: ProjectType, array: true, name: 'types' })
  types: ProjectType[];

  @Column({ name: 'is_first_tattoo' })
  isFirstTattoo: boolean;

  @Column({ name: 'is_cover_up' })
  isCoverUp: boolean;

  @Column({ name: 'is_post_operation_or_over_scar' })
  isPostOperationOrOverScar: boolean;

  @Column({ type: 'varchar', length: 255 })
  zone: string;

  @Column({ name: 'height_cm' })
  heightCm: number;

  @Column({ name: 'width_cm' })
  widthCm: number;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'additional_information',
  })
  additionalInformation?: string;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'customer_availability',
  })
  customerAvailability?: string;

  @Column({ nullable: true, name: 'customer_rating' })
  customerRating?: number;

  @Column({ nullable: true, name: 'shop_rating' })
  shopRating?: number;

  @OneToMany(() => ChatEventSchema, (chatEvent) => chatEvent.project)
  events: ChatEventSchema[];
}
