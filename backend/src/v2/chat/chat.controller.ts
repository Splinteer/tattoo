import { Controller, MessageEvent, Req, Sse, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { Observable } from 'rxjs';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { ChatNotificationService } from './chat-notification/chat-notification.service';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';

@ApiTags('chat')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard())
@Controller({
  path: 'chats',
  version: '2',
})
export class ChatController {
  constructor(
    private readonly chatNotificationService: ChatNotificationService,
  ) {}

  @ApiOperation({
    summary: 'Establish an SSE connection to receive chat events',
  })
  @ApiOkResponse({ description: 'Successfully established an SSE connection' })
  @Sse('events')
  sse(
    @Req() request: Request,
    @Credentials()
    credentials: ICredentials,
  ): Observable<MessageEvent> {
    return this.chatNotificationService.addClient(credentials.id, request);
  }
}
