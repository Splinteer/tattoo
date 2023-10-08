import {
  Entity,
  PrimaryColumn,
  Column,
  OneToMany,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ProjectSchema } from '../project/project.entity';
import { ChatEventSchema } from './event/event.entity';

@Entity('chat')
export class ChatSchema {
  @PrimaryColumn({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'creation_date', type: 'timestamp', default: () => 'NOW()' })
  creationDate: Date;

  @Column({ name: 'last_update', type: 'timestamp', default: () => 'NOW()' })
  lastUpdate: Date;

  @ManyToOne(() => ProjectSchema)
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  @OneToMany(() => ChatEventSchema, (chatEvent) => chatEvent.chat)
  chatEvents: ChatEventSchema[];
}
