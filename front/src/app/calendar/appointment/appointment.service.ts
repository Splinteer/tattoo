import { Injectable, inject } from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';
import { Observable } from 'rxjs';
import { AppointmentEvent } from '../calendar.service';

export type Appointment = {
  id: string;
  projectId: string;
  creationDate: string;
  startDate: string;
  endDate: string;
  createdByShop: boolean;
  isConfirmed: boolean;
};

@Injectable({
  providedIn: 'root',
})
export class AppointmentService {
  readonly #http = inject(HttpService);

  get(projectId: string, id: string): Observable<Appointment> {
    return this.#http.get<Appointment>(
      `/v2/projects/${projectId}/appointments/${id}`,
    );
  }

  getEvent(projectId: string, id: string): Observable<AppointmentEvent> {
    return this.#http.get<AppointmentEvent>(
      `/v2/projects/${projectId}/appointments/${id}/event`,
    );
  }

  cancel(projectId: string, id: string): Observable<void> {
    return this.#http.delete<void>(
      `/v2/projects/${projectId}/appointments/${id}`,
    );
  }
}
