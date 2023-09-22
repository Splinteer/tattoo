import {
  BadRequestException,
  Controller,
  Get,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { Credentials } from 'src/v1/auth/session/session.decorator';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { AppointmentService } from './appointment.service';
import { CalendarService } from '../calendar.service';
import {
  ChatEventService,
  ChatEventType,
} from 'src/v1/chat/chat-event/chat-event.service';
import { ChatService } from 'src/v1/chat/chat.service';

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
    private readonly chatService: ChatService,
    private readonly chatEventService: ChatEventService,
  ) {}

  @Get(':id/accept')
  @UseGuards(new AuthGuard())
  async acceptAppointment(
    @Param('id') appointmentId: string,
    @Credentials()
    credentials: ICredentials,
  ) {
    return;
    const appointment = await this.appointmentService.accept(appointmentId);
    await this.appointmentService.removeUnconfirmed(appointment.project_id);

    const { id: chatId } = await this.chatService.getChatByProject(
      appointment.project_id,
    );

    if (!chatId) {
      throw new BadRequestException();
    }

    const event = await this.chatEventService.addEvent(
      chatId,
      credentials.id,
      ChatEventType.appointment_accepted,
      appointment.id,
    );

    this.chatEventService.sendEventToUser(event.id).catch(console.error);
  }
}
