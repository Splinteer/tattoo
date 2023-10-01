import { ShopSchema } from 'src/entitiees/shop.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  ManyToMany,
} from 'typeorm';
import { ProjectSchema } from '../project/project.entity';

@Entity('flash')
export class FlashSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToMany(() => ProjectSchema, (project) => project.flashs)
  projects: ProjectSchema[];

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

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 255 })
  description: string;

  @Column({ name: 'image_url', type: 'varchar', length: 255 })
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
