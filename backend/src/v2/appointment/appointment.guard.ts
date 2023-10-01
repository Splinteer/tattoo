import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { AppointmentService } from './appointment.service';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { getSession } from 'supertokens-node/recipe/session';

@Injectable()
export class AppointmentGuard implements CanActivate {
  constructor(private readonly appointmentService: AppointmentService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const params = request.params;
    const appointmentId = params.appointmentId || params.id;

    try {
      const session = await getSession(request, response);
      const credentials = session.getAccessTokenPayload()
        .credentials as ICredentials;

      return this.validateAccess(credentials, appointmentId);
    } catch (error) {
      if (error.type === 'UNAUTHORISED') {
        throw new ForbiddenException();
      }

      throw error;
    }
  }

  async validateAccess(
    user: ICredentials,
    appointmentId: string,
  ): Promise<boolean> {
    const appointment = await this.appointmentService.getById(appointmentId);
    if (!appointment) {
      throw new UnauthorizedException('Appointment not found');
    }

    if (
      appointment.project.customerId !== user.id &&
      appointment.project.shopId !== user.shop_id
    ) {
      throw new UnauthorizedException(
        'You do not have permission to access this appointment',
      );
    }

    return true;
  }
}
