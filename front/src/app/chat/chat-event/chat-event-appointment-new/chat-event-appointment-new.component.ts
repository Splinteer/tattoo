import {
  ChangeDetectionStrategy,
  Component,
  Input,
  WritableSignal,
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
    <div class="ios-dialog" *ngIf="{ appointment: appointmentSignal() } as vm">
      <div class="content">
        <div class="headline" translate>
          {{
            vm.appointment && vm.appointment.type === 'appointment_proposal'
              ? 'Nouveau créneau proposé'
              : 'Créneau proposé'
          }}
        </div>
        <span *ngIf="vm.appointment">
          <app-calendar-item
            [event]="vm.appointment"
            hideTitle
            date
          ></app-calendar-item>
        </span>
      </div>

      <div
        class="buttons"
        *ngIf="vm.appointment && vm.appointment.type === 'appointment_proposal'"
      >
        <button (click)="reject()" class="danger" translate>Rejeter</button>
        <button (click)="accept()" class="emphasized" translate>
          Accepter
        </button>
      </div>
    </div>
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
    if (!this.event.property.appointmentId) {
      return null;
    }

    const project = this.projectSignal();
    console.log({ project });
    if (!project) {
      return null;
    }

    const found = project.appointments?.find(
      (appointment) => appointment.id === this.event.property.appointmentId
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
