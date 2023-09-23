import { ApiProperty } from '@nestjs/swagger';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { CustomerSchema } from './customer.entity';

@Entity('shop')
export class ShopSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => CustomerSchema)
  @JoinColumn({ name: 'owner_id' })
  owner: CustomerSchema;

  @Column({ name: 'owner_id', type: 'uuid' })
  ownerId: string;

  @Column({
    name: 'creation_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  creationDate: Date;

  @Column({
    name: 'last_update',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  lastUpdate: Date;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  url: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ name: 'booking_condition', nullable: true, default: '' })
  bookingCondition: string;

  @Column({ name: 'got_profile_picture', default: false })
  gotProfilePicture: boolean;

  @Column({ name: 'profile_picture_version', default: 0 })
  profilePictureVersion: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instagram: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twitter: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  facebook: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  website: string;

  @Column({ name: 'auto_generate_availability', default: false })
  autoGenerateAvailability: boolean;

  @Column({ name: 'repeat_availability_every', default: 1 })
  repeatAvailabilityEvery: number;

  @Column({
    type: 'varchar',
    length: 10,
    name: 'repeat_availability_time_unit',
    default: 'month',
  })
  repeatAvailabilityTimeUnit: string;

  @Column({ name: 'min_appointment_time', default: 60 })
  minAppointmentTime: number;
}
