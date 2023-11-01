import {
  Body,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  NotFoundException,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiBadRequestResponse,
  ApiForbiddenResponse,
  ApiOperation,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { ProjectGuard } from '../project.guard';
import { AppointmentService } from 'src/v2/appointment/appointment.service';
import { AppointmentsProposalDto } from './dto/appointments-proposal.dto';
import { GuardRole } from '@app/common/decorators/guard-role.decorator';
import { ProjectRole } from '../project.interface';
import { ChatEvent, EventService } from 'src/v2/project/event/event.service';
import { ProjectService } from '../project.service';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { ChatEventType } from 'src/v2/project/event/event.entity';
import {
  AppointmentEvent,
  AppointmentType,
} from 'src/v1/shop/calendar/calendar.service';
import { ShopService } from 'src/v1/shop/shop.service';

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ProjectGuard)
@Controller({
  path: 'projects/:projectId/appointments',
  version: '2',
})
export class ProjectAppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly projectService: ProjectService,
    private readonly eventService: EventService,
    private readonly shopService: ShopService,
  ) {}

  @ApiOperation({ description: 'Returns an appointment' })
  @ApiOkResponse({ description: 'Returns an appointment' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Get(':id')
  async get(@Param('projectId') projectId: string, @Param('id') id: string) {
    const appointment = await this.appointmentService.get(projectId, id);
    if (!appointment) {
      throw new NotFoundException();
    }

    return appointment;
  }

  // To remove when stable
  @ApiOperation({ description: 'Returns the calendar event' })
  @ApiOkResponse({ description: 'Returns the calendar event' })
  @ApiNotFoundResponse({ description: 'Not found' })
  @Get(':id/event')
  async getEvent(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
  ): Promise<AppointmentEvent> {
    const project = await this.projectService.getById(projectId);
    const appointment = await this.appointmentService.get(projectId, id);
    if (!appointment) {
      throw new NotFoundException();
    }

    const shop = await this.shopService.getById(project.shopId);

    let eventType: AppointmentType = 'Appointment';
    if (project.isPaid) {
      eventType = 'paid_Appointment';
    } else if (appointment.isConfirmed) {
      eventType = 'confirmed_Appointment';
    } else if (appointment.createdByShop) {
      eventType = 'proposal';
    }

    return {
      event_type: eventType,
      id: appointment.id,
      shop_url: shop.url,
      start_time: appointment.startDate,
      end_time: appointment.endDate,
      properties: {
        project_id: projectId,
        is_paid: project.isPaid,
      },
    };
  }

  @Delete(':id')
  async delete(
    @Param('projectId') projectId: string,
    @Param('id') id: string,
    @GuardRole('projectRole') role: ProjectRole,
  ) {
    const appointment = await this.appointmentService.get(projectId, id);
    if (!appointment) {
      throw new NotFoundException();
    }

    if (
      appointment.isConfirmed ||
      (appointment.createdByShop && role !== ProjectRole.SHOP)
    ) {
      throw new ForbiddenException();
    }

    // TODO

    await this.appointmentService.delete(id);
  }

  @ApiOkResponse({ description: 'Returns all project appointments' })
  @Get()
  getAll(@Param('projectId') projectId: string) {
    return this.appointmentService.getCalendarEventsByProject(projectId);
  }

  @ApiOkResponse({ description: 'Appointments created' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @Post('/proposals')
  async createProposals(
    @Param('projectId') projectId: string,
    @Credentials()
    credentials: ICredentials,
    @GuardRole('projectRole') role: ProjectRole,
    @Body() { proposals }: AppointmentsProposalDto,
  ): Promise<ChatEvent | any> {
    if (role !== ProjectRole.SHOP) {
      throw new ForbiddenException();
    }

    const event = await this.eventService.create(
      projectId,
      credentials.id,
      ChatEventType.APPOINTMENT_NEW,
    );

    try {
      await Promise.all(
        proposals.map(async (proposal) => {
          const appointment = await this.appointmentService.createProposal(
            projectId,
            proposal,
          );

          try {
            await this.eventService.createAppointmentNewEvent(
              event.id,
              appointment.id,
            );
          } catch (error) {
            this.appointmentService.delete(appointment.id);

            throw error;
          }
        }),
      );

      this.eventService.sendEvent(event.id).catch();
      return this.eventService.get(event.id, credentials.id);
    } catch (error) {
      this.eventService.delete(event.id);

      throw error;
    }
  }
}
