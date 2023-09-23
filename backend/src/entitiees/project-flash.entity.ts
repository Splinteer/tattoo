import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectSchema } from './project.entity'; // Assuming you have a Project model defined
import { Flash } from './flash.entity'; // Assuming you have a Flash model defined

@Entity('project_flash')
export class ProjectFlash {
  @ManyToOne(() => ProjectSchema, { cascade: true })
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => Flash, { cascade: true })
  @JoinColumn({ name: 'flash_id' })
  flash: Flash;

  @Column({ name: 'flash_id', type: 'uuid' })
  flashId: string;
}
