import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ChatService } from './chat.service';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { getSession } from 'supertokens-node/recipe/session';

@Injectable()
export class ChatGuard implements CanActivate {
  constructor(private readonly chatService: ChatService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const params = request.params;
    const chatId = params.chatId || params.id;

    try {
      const session = await getSession(request, response);
      const credentials = session.getAccessTokenPayload()
        .credentials as ICredentials;

      return this.validateAccess(credentials, chatId);
    } catch (error) {
      if (error.type === 'UNAUTHORISED') {
        throw new ForbiddenException();
      }

      throw error;
    }
  }

  async validateAccess(user: ICredentials, chatId: string): Promise<boolean> {
    const chat = await this.chatService.getById(chatId);
    if (!chat) {
      throw new UnauthorizedException('Chat not found');
    }

    if (
      chat.project.customerId !== user.id &&
      chat.project.shopId !== user.shop_id
    ) {
      throw new UnauthorizedException(
        'You do not have permission to access this chat',
      );
    }

    return true;
  }
}
