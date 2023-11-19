import { ShopSchema } from 'src/entitiees/shop.entity';
import { ChatEventType } from './event/event.entity';
import { ProjectSchema } from './project.entity';
import { CustomerSchema } from 'src/entitiees/customer.entity';

type ChatLastMessageEvent = {
  senderId: string;
  creationDate: Date;
  type: ChatEventType.MESSAGE;
  content: string;
  isRead: true;
};

export type ChatLastEvent =
  | ChatLastMessageEvent
  | (Omit<ChatLastMessageEvent, 'content'> & {
      type: Exclude<ChatEventType, ChatEventType.MESSAGE>;
    });

type BaseConversation = {
  project: ProjectSchema;
  lastEvent: ChatLastEvent;
  events: [];
};

export type CustomerConversation = BaseConversation & {
  type: 'customer';
  shop: ShopSchema;
};

export type ShopConversation = BaseConversation & {
  type: 'shop';
  customer: CustomerSchema;
};

export type Conversation = CustomerConversation | ShopConversation;
