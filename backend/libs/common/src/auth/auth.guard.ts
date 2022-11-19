import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { promisify } from 'util';
import { expressJwtSecret } from 'jwks-rsa';
import { expressjwt } from 'express-jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly configService: ConfigService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const checkJwt = promisify(
      expressjwt({
        secret: <any>expressJwtSecret({
          cache: true,
          rateLimit: true,
          jwksRequestsPerMinute: 5,
          jwksUri: `https://${this.configService.get(
            'AUTH0_DOMAIN',
          )}/.well-known/jwks.json`,
        }),
        audience: `https://${this.configService.get('AUTH0_DOMAIN')}/api/v2/`,
        issuer: `https://${this.configService.get('AUTH0_DOMAIN')}/`,
        algorithms: ['RS256'],
      }),
    );

    try {
      const req = context.getArgByIndex(0);
      const res = context.getArgByIndex(1);

      await checkJwt(req, res);

      return true;
    } catch (error) {
      console.error(error);

      throw new UnauthorizedException();
    }
  }
}
