import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectSchema } from '../../entitiees/project.entity';

@Entity('appointment')
export class AppointmentSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => ProjectSchema)
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  @JoinColumn({ name: 'project_id' })
  projectId: string;

  @Column({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(3)',
    name: 'creation_date',
  })
  creationDate: Date;

  @Column({ type: 'timestamp', name: 'start_date' })
  startDate: Date;

  @Column({ type: 'timestamp', nullable: true, name: 'end_date' })
  endDate: Date | null;

  @Column({ default: false, name: 'created_by_shop' })
  createdByShop: boolean;

  @Column({ default: false, name: 'is_confirmed' })
  isConfirmed: boolean;
}
