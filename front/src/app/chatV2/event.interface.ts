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

export type ChatEventBase = {
  id: string;
  projectId: string;
  creationDate: string;
  isSender: boolean;
  isRead: boolean;
};

export type ChatEventMessage = ChatEventBase & {
  type: ChatEventType.MESSAGE;
  property: {
    text: string;
  };
};

export type ChatEventMedia = ChatEventBase & {
  type: ChatEventType.MEDIA;
  property: {
    urls: string[];
  };
};

export type ChatEventAppointmentNew = ChatEventBase & {
  type: ChatEventType.APPOINTMENT_NEW;
  property: {
    appointmentIds: string[];
  };
};

export type SimpleChatEvent = ChatEventBase & {
  type: ChatEventType.PROJECT_CREATED;
};

export type ChatEvent =
  | SimpleChatEvent
  | ChatEventMessage
  | ChatEventMedia
  | ChatEventAppointmentNew;
