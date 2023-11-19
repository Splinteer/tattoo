import { Project } from '@app/project/project.service';
import { ChatEventType, ChatEvent } from './event.interface';
import { WritableSignal } from '@angular/core';

// Temp
export interface Shop {
  id: string;
  owner: Customer;
  ownerId: string;
  creationDate: string;
  lastUpdate: string;
  name: string;
  url: string;
  description: string | null;
  bookingCondition: string | null;
  gotProfilePicture: boolean;
  profilePictureVersion: number;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
  autoGenerateAvailability: boolean;
  repeatAvailabilityEvery: number;
  repeatAvailabilityTimeUnit: string;
  minAppointmentTime: number;
}

export interface Customer {
  id: string;
  supertokensId: string;
  creationDate: string;
  lastUpdate: string;
  email: string;
  firstname: string | null;
  lastname: string | null;
  birthday: Date | null;
  gotProfilePicture: boolean;
  profilePictureVersion: number;
  pronouns: string | null;
  phone: string | null;
  instagram: string | null;
  twitter: string | null;
  personalInformation: string | null;
  address: string | null;
  address2: string | null;
  city: string | null;
  zipcode: string | null;
}

type ChatLastEventBase = {
  senderId: string;
  creationDate: string;
  isRead: true;
};

type ChatLastMessageEvent = ChatLastEventBase & {
  type: ChatEventType.MESSAGE;
  content: string;
};

export type ChatLastEvent =
  | ChatLastMessageEvent
  | (ChatLastEventBase & {
      type: Exclude<ChatEventType, ChatEventType.MESSAGE>;
    });

type BaseConversation = {
  project: Project;
  lastEvent: ChatLastEvent;
  events: WritableSignal<ChatEvent[]>;
  noMoreEvents?: true;
};

export type CustomerConversation = BaseConversation & {
  type: 'customer';
  shop: Shop;
};

export type ShopConversation = BaseConversation & {
  type: 'shop';
  customer: Customer;
};

export type Conversation = CustomerConversation | ShopConversation;
