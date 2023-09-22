import { Injectable } from '@nestjs/common';
import Session from 'supertokens-node/recipe/session';
import { CredentialsService } from '../credentials/credentials.service';

@Injectable()
export class SessionService {
  constructor(private readonly credentialsService: CredentialsService) {}

  public async refreshSession(supertokenId: string) {
    const sessionHandles = await Session.getAllSessionHandlesForUser(
      supertokenId,
    );

    if (sessionHandles.length === 0) {
      return;
    }

    const credentials = await this.credentialsService.get(supertokenId);

    await Promise.all(
      sessionHandles.map(async (sessionHandle) => {
        if (sessionHandle === undefined) {
          return;
        }

        await Session.mergeIntoAccessTokenPayload(sessionHandle, {
          credentials: { ...credentials },
        });
      }),
    );
  }
}
