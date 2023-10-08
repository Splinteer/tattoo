import { CustomerSchema } from 'src/entitiees/customer.entity';
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToOne,
} from 'typeorm';
import { ChatSchema } from '../chat.entity';
import {
  ChatEventMessageSchema,
  ChatEventMediaSchema,
  ChatEventAppointmentNewSchema,
} from './entity/event-types.entity';

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

  @Column({ name: 'chat_id', type: 'uuid' })
  chatId: string;

  @Column({ name: 'creation_date', type: 'timestamp', default: () => 'NOW()' })
  creationDate: Date;

  @Column({ name: 'sender_id', type: 'uuid' })
  senderId: string;

  @Column({ type: 'enum', enum: ChatEventType })
  type: ChatEventType;

  @Column({ name: 'is_read', default: false })
  isRead: boolean;

  @ManyToOne(() => ChatSchema, (chat) => chat.chatEvents)
  @JoinColumn({ name: 'chat_id' })
  chat: ChatSchema;

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
