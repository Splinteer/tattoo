import {
  ChangeDetectionStrategy,
  Component,
  Input,
  computed,
  inject,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '@app/project/project.service';
import { CalendarItemComponent } from '@app/calendar/calendar-item/calendar-item.component';
import { CalendarService } from '@app/calendar/calendar.service';
import { ChatEventAppointmentNew } from '../chat-event.type';

@Component({
  selector: 'app-chat-event-appointment-new',
  standalone: true,
  imports: [CommonModule, CalendarItemComponent],
  template: `
    @if ({ appointment: appointmentSignal() }; as vm) {
    <div class="ios-dialog">
      <div class="content">
        <div class="headline" translate>
          {{
            vm.appointment && vm.appointment.type === 'appointment_proposal'
              ? 'Nouveau créneau proposé'
              : 'Créneau proposé'
          }}
        </div>
        @if (vm.appointment) {
        <span>
          <app-calendar-item
            [event]="vm.appointment"
            hideTitle
            date
          ></app-calendar-item>
        </span>
        }
      </div>

      @if (vm.appointment && vm.appointment.type === 'appointment_proposal') {
      <div class="buttons">
        <button (click)="reject()" class="danger" translate>Rejeter</button>
        <button (click)="accept()" class="emphasized" translate>
          Accepter
        </button>
      </div>
      }
    </div>
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ChatEventAppointmentNewComponent {
  readonly #calendarService = inject(CalendarService);

  readonly #projectService = inject(ProjectService);

  @Input({ required: true }) event!: ChatEventAppointmentNew;

  readonly projectSignal = this.#projectService.project;

  projectRealoaded = false;

  appointmentSignal = computed(() => {
    if (!this.event.property.appointmentIds) {
      return null;
    }

    const project = this.projectSignal();
    if (!project) {
      return null;
    }

    const found = project.appointments?.find((appointment) =>
      this.event.property.appointmentIds.includes(appointment.id),
    );
    if (!found && !this.projectRealoaded) {
      this.projectRealoaded = true;
      // this.#projectService.reload();
      return null;
    }

    return found;
  });

  accept() {
    const appointment = this.appointmentSignal();
    if (!appointment) {
      return;
    }

    this.#calendarService.confirmAppointment(appointment);
  }

  reject() {
    const appointment = this.appointmentSignal();
    if (!appointment) {
      return;
    }

    this.#calendarService.rejectAppointment(appointment);
  }
}
