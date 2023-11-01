import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ProjectSchema } from 'src/v2/project/project.entity';

export enum ChatEventType {
  APPOINTMENT_NEW = 'appointment_new',
  APPOINTMENT_ACCEPTED = 'appointment_accepted',

  DEPOSIT_REQUEST = 'deposit_request',
  DEPOSIT_PAID = 'deposit_paid',

  MESSAGE = 'message',
  MEDIA = 'media',

  PROJECT_CREATED = 'project_created',
  PROJECT_CANCELLED = 'project_cancelled',
  PROJECT_REJECTED = 'project_rejected',
  PROJECT_COMPLETED = 'project_completed',
}

@Entity('chat_event')
export class ChatEventSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'project_id', type: 'uuid' })
  projectId: string;

  @Column({ name: 'creation_date', type: 'timestamp', default: () => 'NOW()' })
  creationDate: Date;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ type: 'enum', enum: ChatEventType })
  type: ChatEventType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @ManyToOne(() => ProjectSchema, (project) => project.events)
  @JoinColumn({ name: 'project_id' })
  project: ProjectSchema;

  // @ManyToOne(() => CustomerSchema)
  // @JoinColumn({ name: 'sender_id' })
  // sender: CustomerSchema;

  // @OneToOne(() => ChatEventMessageSchema)
  // @JoinColumn({ name: 'id' })
  // messageEvent?: ChatEventMessageSchema;

  // @OneToOne(() => ChatEventMediaSchema)
  // @JoinColumn({ name: 'id' })
  // mediaEvent?: ChatEventMediaSchema;

  // @OneToOne(() => ChatEventAppointmentNewSchema)
  // @JoinColumn({ name: 'id' })
  // appointmentNewEvent?: ChatEventAppointmentNewSchema;
}
