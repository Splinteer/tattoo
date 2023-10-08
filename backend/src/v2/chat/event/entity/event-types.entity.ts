import { Entity, PrimaryColumn, Column, OneToOne, JoinColumn } from 'typeorm';
import { ChatEventSchema } from '../event.entity';

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
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ type: 'text' })
  url: string;

  @OneToOne(() => ChatEventSchema)
  @JoinColumn({ name: 'event_id' })
  event: ChatEventSchema;
}

// ChatEventAppointmentNew Entity
@Entity('chat_event_appointment_new')
export class ChatEventAppointmentNewSchema {
  @PrimaryColumn({ name: 'event_id', type: 'uuid' })
  eventId: string;

  @Column({ name: 'appointment_id', type: 'uuid' })
  appointmentId: string;

  @OneToOne(() => ChatEventSchema)
  @JoinColumn({ name: 'event_id' })
  event: ChatEventSchema;
}
