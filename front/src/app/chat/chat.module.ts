import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ChatRoutingModule } from './chat-routing.module';
import { ChatComponent } from './chat.component';
import { FormsModule } from '@angular/forms';
import { ChatListComponent } from './chat-list/chat-list.component';
import { ChatService } from './chat.service';
import { SharedModule } from '@app/shared/shared.module';

@NgModule({
  declarations: [ChatComponent, ChatListComponent],
  imports: [CommonModule, FormsModule, ChatRoutingModule, SharedModule],
  providers: [ChatService],
})
export class ChatModule {}
