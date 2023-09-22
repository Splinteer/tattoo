import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap, tap, first } from 'rxjs/operators';
import { calendar_v3, google } from 'googleapis';
import { readFileSync } from 'fs';
import { join } from 'path';
import { EventType } from '../calendar.service';
import { RawAxiosRequestHeaders } from 'axios';
import { DateTime } from 'luxon';
type ObservableValue<T> = T extends Observable<infer U> ? U : never;

@Injectable()
export class GoogleCalendarService {
  private readonly BASE_URL = 'https://www.googleapis.com/calendar/v3';

  private credentials: any;

  private readonly calendarNames = [
    'Appointment',
    'Availability',
    'Unavailability',
  ];

  private readonly calendars: {
    [key in EventType]?: calendar_v3.Schema$CalendarListEntry;
  } = {};

  constructor(private readonly http: HttpService) {
    this.loadCredentials().subscribe();
  }

  private watch(calendarId: string, watchId: string) {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.post<{
          kind: 'api#channel';
          id: string;
          resourceId: string;
          resourceUri: string;
          token: string;
          expiration: number;
        }>(
          `${this.BASE_URL}/calendars/${calendarId}/events/watch`,
          {
            id: watchId,
            type: 'web_hook',
            address:
              'https://us-central1-tattoo-360012.cloudfunctions.net/eventNotification?calendar=' +
              calendarId,
          },
          { headers },
        );
      }),
      map(({ data }) => {
        const { resourceId, expiration } = data;
        // TODO save resourceId

        return data;
      }),
    );
  }

  private stopWatching(calendarId: string, resourceId: string) {
    return this.getHeaders().pipe(
      switchMap((headers) => {
        return this.http.post<
          calendar_v3.Params$Resource$Calendarlist$Insert[]
        >(
          `${this.BASE_URL}/channels/stop`,
          {
            id: calendarId,
            resourceId,
          },
          { headers },
        );
      }),
    );
  }

  private loadCredentials() {
    return this.getAuth().pipe(
      first(),
      switchMap(() => this.getCalendarsId(this.calendarNames)),
      tap((calendars: calendar_v3.Schema$CalendarListEntry[]) => {
        calendars.forEach((calendar) => {
          this.calendars[calendar.summary] = calendar;
        });
      }),
    );
  }

  private getAuth() {
    return new Observable((observer) => {
      try {
        const googleServiceAccountKey = readFileSync(
          join('google-service-account-key.json'),
        );

        const SERVICE_ACCOUNT_KEY: any = JSON.parse(
          googleServiceAccountKey.toString(),
        );

        const jwtClient = new google.auth.JWT(
          SERVICE_ACCOUNT_KEY.client_email,
          null,
          SERVICE_ACCOUNT_KEY.private_key,
          [
            'https://www.googleapis.com/auth/calendar',
            'https://www.googleapis.com/auth/calendar.events',
          ],
        );

        jwtClient.authorize((err, tokens) => {
          if (err) {
            observer.error(err);
          } else {
            observer.next(tokens);
            observer.complete();
          }
        });
      } catch (error) {
        return observer.error(error);
      }
    }).pipe(map((credentials) => (this.credentials = credentials)));
  }

  private getHeaders(): Observable<RawAxiosRequestHeaders> {
    if (!this.credentials) {
      return this.loadCredentials().pipe(switchMap(() => this.getHeaders()));
    }

    return of({
      Authorization: `Bearer ${this.credentials.access_token}`,
    });
  }

  shareCalendarWithUser(
    calendarId: string,
    gmailAddress: string,
    role = 'writer',
  ) {
    const aclEndpoint = `${this.BASE_URL}/calendars/${calendarId}/acl`;

    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.post(
          aclEndpoint,
          {
            role: role,
            scope: {
              type: 'user',
              value: gmailAddress,
            },
          },
          { headers },
        ),
      ),
      catchError((error) => {
        console.error('Error sharing calendar:', error.response?.data);
        throw error;
      }),
    );
  }

  private getCalendarsId(
    calendarNames: string[],
  ): Observable<calendar_v3.Schema$CalendarListEntry[]> {
    return this.fetchCalendarsIdByName(calendarNames).pipe(
      switchMap((existingCalendars) => {
        const existingCalendarsKeys = existingCalendars.map(
          (calendar) => calendar.summary,
        );
        const missingCalendars = calendarNames.filter(
          (calendar) => !existingCalendarsKeys.includes(calendar),
        );

        if (missingCalendars.length) {
          return this.createMissingCalendars(missingCalendars).pipe(
            switchMap(() => this.fetchCalendarsIdByName(this.calendarNames)),
          );
        }

        return of(existingCalendars);
      }),
    );
  }

  private createMissingCalendars(missingCalendars: string[]) {
    const creationObservables = missingCalendars.map((calendarName) =>
      this.createCalendar(calendarName),
    );

    return forkJoin(creationObservables);
  }

  private fetchCalendarsIdByName(calendarNames: string[]) {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.get<calendar_v3.Schema$CalendarList>(
          `${this.BASE_URL}/users/me/calendarList`,
          {
            headers: headers,
          },
        ),
      ),
      map((calendars) => {
        return calendars.data.items.filter((calendar) =>
          calendarNames.includes(calendar.summary),
        );
      }),
    );
  }

  createCalendar(calendarName: string) {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.post<calendar_v3.Params$Resource$Calendarlist$Insert[]>(
          `${this.BASE_URL}/calendars`,
          { summary: calendarName },
          { headers },
        ),
      ),
      map((response) => response.data),
      catchError((error) => {
        console.error('Error creating calendar:', error.response?.data);
        throw error;
      }),
    );
  }

  createEventWithName(
    calendarName: string,
    eventData: calendar_v3.Schema$Event,
  ) {
    return this.getCalendarsId([calendarName]).pipe(
      switchMap(([calendar]) => {
        return this.createEvent(calendar.id, eventData);
      }),
    );
  }

  createEvent(calendarId: string, eventData: calendar_v3.Schema$Event) {
    console.log(calendarId, eventData);
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.post<calendar_v3.Params$Resource$Events$Insert>(
          `${this.BASE_URL}/calendars/${calendarId}/events`,
          eventData,
          {
            headers,
          },
        ),
      ),
      map((response) => response.data),
      catchError((error) => {
        console.error('Error creating event:', error.response?.data);
        throw error;
      }),
    );
  }

  updateEvent(
    calendarId: string,
    eventId: string,
    updatedEventData: calendar_v3.Schema$Event,
  ) {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.put<calendar_v3.Params$Resource$Events$Update>(
          `${this.BASE_URL}/calendars/${calendarId}/events/${eventId}`,
          updatedEventData,
          { headers },
        ),
      ),
      map((response) => response.data),
      catchError((error) => {
        console.error('Error updating event:', error.response?.data);
        throw error;
      }),
    );
  }

  deleteEvent(calendarId: string, eventId: string): Observable<void> {
    return this.getHeaders().pipe(
      switchMap((headers) =>
        this.http.delete<calendar_v3.Params$Resource$Events$Delete>(
          `${this.BASE_URL}/calendars/${calendarId}/events/${eventId}`,
          {
            headers,
          },
        ),
      ),
      map(() => {
        return;
      }),
      catchError((error) => {
        console.error('Error deleting event:', error.response?.data);
        throw error;
      }),
    );
  }

  getStartAndEnd(startTime: Date, endTime: Date) {
    const start = DateTime.fromJSDate(startTime);
    const end = DateTime.fromJSDate(endTime);
    const isAllDay = end.diff(start, 'minutes').minutes >= 1439;

    const startObject = isAllDay
      ? { date: start.toISODate() }
      : { dateTime: start.toISO() };
    const endObject = isAllDay
      ? { date: end.toISODate() }
      : { dateTime: end.toISO() };

    return { start: startObject, end: endObject };
  }

  getCalendarId(calendarName: EventType) {
    return this.calendars[calendarName].id;
  }
}
