import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { ProjectGuard } from '../project.guard';
import { AppointmentService } from 'src/v2/appointment/appointment.service';

@Controller('project-appointment')
export class ProjectAppointmentController {}

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ProjectGuard)
@Controller({
  path: 'projects/:id/appointments',
  version: '2',
})
export class ProjectController {
  constructor(private readonly appointmentService: AppointmentService) {}

  @ApiOkResponse({ description: 'Returns all project appointments' })
  @Get()
  getAll(@Param('projectId') projectId: string) {
    return this.appointmentService.getCalendarEventsByProject(projectId);
  }
}
