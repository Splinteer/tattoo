import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ShopSchema } from './shop.entity';

@Entity('flash')
export class Flash {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ShopSchema)
  @JoinColumn({ name: 'shop_id' })
  shop: ShopSchema;

  @Column({ name: 'shop_id', type: 'uuid' })
  shopId: string;

  @Column({
    name: 'creation_date',
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
  })
  creationDate: Date;

  @Column()
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ name: 'image_url' })
  imageUrl: string;

  @Column({ name: 'image_version', default: 0 })
  imageVersion: number;

  @Column({ default: true })
  available: boolean;

  @Column({ name: 'price_range_start', nullable: true })
  priceRangeStart: number;

  @Column({ name: 'price_range_end', nullable: true })
  priceRangeEnd: number;
}
