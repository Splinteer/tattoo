import { Entity, Column, ManyToOne, JoinColumn, PrimaryColumn } from 'typeorm';
import { ProjectSchema } from '../project.entity'; // Assuming you have a Project model defined
import { FlashSchema } from 'src/v2/flash/flash.entity';

@Entity('project_flash')
export class ProjectFlashSchema {
  @ManyToOne(() => ProjectSchema, { cascade: true })
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  @PrimaryColumn({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @ManyToOne(() => FlashSchema, { cascade: true })
  @JoinColumn({ name: 'flash_id' })
  flash: FlashSchema;

  @PrimaryColumn({ name: 'flash_id', type: 'uuid' })
  flashId: string;
}
