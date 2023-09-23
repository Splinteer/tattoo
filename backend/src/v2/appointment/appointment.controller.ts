import {
  Controller,
  Delete,
  Get,
  Param,
  UseGuards,
  Version,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AppointmentService } from './appointment.service';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { AppointmentGuard } from './appointment.guard';

@ApiTags('appointment')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard())
@Controller({
  path: 'appointments',
  version: '2',
})
export class AppointmentController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiOkResponse({ description: 'Returns all appointments' })
  @Get()
  getAll(
    @Credentials()
    credentials: ICredentials,
  ) {
    return this.appointmentService.getAll(credentials.id);
  }

  @ApiOkResponse({ description: 'Delete an appointment' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @UseGuards(AppointmentGuard)
  @Delete(':id')
  async delete(@Param('id') id: string) {
    await this.appointmentService.delete(id);
  }
}
