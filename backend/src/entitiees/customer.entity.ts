import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('customer')
export class CustomerSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    name: 'supertokens_id',
    unique: true,
    type: 'uuid',
  })
  supertokensId: string;

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
  email: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstname: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastname: string;

  @Column({ nullable: true, type: 'date' })
  birthday: Date;

  @Column({ name: 'got_profile_picture', default: false })
  gotProfilePicture: boolean;

  @Column({ name: 'profile_picture_version', default: 0 })
  profilePictureVersion: number;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pronouns: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  phone: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  instagram: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  twitter: string;

  @Column({ type: 'text', nullable: true })
  personalInformation: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  address: string;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'address2' })
  address2: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  city: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  zipcode: string;
}
