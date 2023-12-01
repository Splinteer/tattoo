import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { CalendarService } from '@app/calendar/calendar.service';
import { ChatSelectionService } from '@app/chatV2/chat-selection.service';
import { ChatEventAppointmentNew } from '@app/chatV2/event.interface';
import { CalendarItemComponent } from '@app/calendar/calendar-item/calendar-item.component';
import { AppointmentService } from '@app/calendar/appointment/appointment.service';
import { TranslateModule } from '@ngx-translate/core';
import { ConversationService } from '@app/chatV2/conversation.service';
import { CalendarEvent } from '@app/project/project.service';

@Component({
  selector: 'app-conversation-event-appointment-new',
  standalone: true,
  imports: [CommonModule, CalendarItemComponent, TranslateModule],
  template: `
    <div class="ios-dialog light">
      <div class="content">
        <div class="headline" translate>Créneau proposé</div>
        @if (appointments(); as appointments) {
          @for (appointment of appointments; track appointment.id) {
            <span>
              <app-calendar-item
                [event]="appointment"
                hideTitle
                date
              ></app-calendar-item>
              @if (appointments.length > 1) {
                <button
                  (click)="accept(appointment)"
                  class="emphasized"
                  translate
                >
                  CHAT.EVENTS.APPOINTMENT_NEW.accept
                </button>
              }
            </span>
          } @empty {
            Indisponible
          }
          @if (
            appointments.length &&
            appointments[0].type === 'appointment_proposal'
          ) {
            <div class="buttons">
              <button
                (click)="rejectAll()"
                class="danger"
                translate
                [translateParams]="{
                  count: appointments.length
                }"
              >
                CHAT.EVENTS.APPOINTMENT_NEW.reject
              </button>
              @if (appointments.length === 1) {
                <button
                  (click)="accept(appointments[0])"
                  class="emphasized"
                  translate
                >
                  CHAT.EVENTS.APPOINTMENT_NEW.accept
                </button>
              }
            </div>
          }
        }
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConversationEventAppointmentNewComponent {
  @Input({ required: true }) event!: ChatEventAppointmentNew;

  readonly #calendarService = inject(CalendarService);

  readonly #appointmentService = inject(AppointmentService);

  readonly #chatSelectionService = inject(ChatSelectionService);

  readonly #conversationService = inject(ConversationService);

  readonly conversation = this.#chatSelectionService.conversation;

  readonly isCustomer = computed(() => {
    const selectedProfile = this.#chatSelectionService.selectedChatProfile();

    return selectedProfile === 'personal';
  });

  appointments = computed(() => {
    if (!this.event.property.appointmentIds?.length) {
      return [];
    }

    const project = this.conversation()?.project;
    if (!project) {
      return [];
    }

    if (project.appointments === undefined) {
      this.#appointmentService.getEvents(project.id).subscribe((events) => {
        this.#conversationService.update(
          (conversation) =>
            conversation && {
              ...conversation,
              project: {
                ...conversation.project,
                appointments: events,
              },
            },
        );
      });
    }

    return project.appointments?.filter(
      (appointment) =>
        this.event.property.appointmentIds?.includes(appointment.id),
    );
  });

  accept(appointment: CalendarEvent) {
    this.#calendarService.confirmAppointment(appointment);
  }

  rejectAll() {
    const appointments = this.appointments();
    if (!appointments) {
      return;
    }

    // forkJoin();

    // this.#calendarService.rejectAppointment(appointment);
  }
}
