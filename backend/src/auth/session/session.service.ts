import { Injectable } from '@nestjs/common';
import { CustomerService } from 'src/customer/customer.service';
import Session from 'supertokens-node/recipe/session';

@Injectable()
export class SessionService {
  constructor(private readonly customerService: CustomerService) {}

  public async refreshSession(supertokenId: string) {
    const sessionHandles = await Session.getAllSessionHandlesForUser(
      supertokenId,
    );

    if (sessionHandles.length === 0) {
      return;
    }

    const credentials = await this.customerService.getCustomerCredentials(
      supertokenId,
    );

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
