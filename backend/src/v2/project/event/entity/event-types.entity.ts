import {
  Entity,
  PrimaryColumn,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
  ManyToOne,
} from 'typeorm';
import { ChatEventSchema } from '../event.entity';
import { AppointmentSchema } from 'src/v2/appointment/appointment.entity';

// ChatEventMessage Entity
@Entity('chat_event_message')
export class ChatEventMessageSchema {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'text' })
  content: string;

  @OneToOne(() => ChatEventSchema)
  @JoinColumn({ name: 'event_id' })
  event: ChatEventSchema;
}

@Entity('chat_event_media')
export class ChatEventMediaSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'text' })
  url: string;

  @ManyToOne(() => ChatEventSchema)
  @JoinColumn({ name: 'event_id' })
  event: ChatEventSchema;
}

@Entity('chat_event_appointment_new')
export class ChatEventAppointmentNewSchema {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @ManyToOne(() => ChatEventSchema)
  @JoinColumn({ name: 'event_id' })
  event: ChatEventSchema;

  @OneToOne(() => AppointmentSchema)
  @JoinColumn({ name: 'appointment_id' })
  appointment: AppointmentSchema;
}
