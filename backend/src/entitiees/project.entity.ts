import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomerSchema } from './customer.entity';
import { ShopSchema } from './shop.entity';

export enum ProjectType {
  FLASHS = 'flashs',
  CUSTOM = 'custom',
  ADJUSTMENT = 'adjustment',
}

@Entity('project')
export class ProjectSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

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
  additionalInformation: string;

  @Column({ name: 'is_paid', default: false })
  isPaid: boolean;

  @Column({
    type: 'varchar',
    length: 255,
    nullable: true,
    name: 'customer_availability',
  })
  customerAvailability: string;

  @Column({ nullable: true, name: 'customer_rating' })
  customerRating: number;

  @Column({ nullable: true, name: 'shop_rating' })
  shopRating: number;
}
