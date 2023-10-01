import { Entity, ManyToOne, Column, PrimaryColumn, JoinColumn } from 'typeorm';
import { ProjectSchema } from './project.entity';
import { StorageService } from '@app/common/storage/storage.service';
import { Inject } from '@nestjs/common';

export enum ProjectAttachmentType {
  ILLUSTRATION = 'illustration',
  LOCATION = 'location',
}

@Entity('project_attachment')
export class ProjectAttachmentSchema {
  @ManyToOne(() => ProjectSchema)
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  @PrimaryColumn({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @PrimaryColumn({ name: 'image_url', type: 'varchar', length: 255 })
  imageUrl: string;

  @Column({
    type: 'enum',
    enum: ProjectAttachmentType,
  })
  type: ProjectAttachmentType;
}
