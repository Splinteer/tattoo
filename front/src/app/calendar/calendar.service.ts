import {
  Injectable,
  WritableSignal,
  computed,
  inject,
  signal,
} from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';
import { DateTime } from 'luxon';
import { CalendarSelectionService } from './calendar-selection.service';
import { ChatEvent, ChatService } from '@app/chat/chat.service';
import { AppointmentStatus, ProjectV1 } from '@app/project/project.service';
import { CalendarEvent as CalendarEventV2 } from '@app/project/project.service'

type EmptyObj = Record<PropertyKey, never>;

export type AppointmentType =
  | 'Appointment'
  | 'paid_Appointment'
  | 'confirmed_Appointment'
  | 'proposal';

export type EventType = AppointmentType | 'Availability' | 'Unavailability';

export type BaseCalendarEvent = {
  id: string;
  shop_url: string;
  start_time: string;
  end_time: string;
  event_type: EventType;
  properties?: EmptyObj;
};

export type AppointmentEvent = BaseCalendarEvent & {
  event_type: AppointmentType;
  properties: {
    project_id: string;
    is_paid: string;
  };
};

export type CalendarEvent = AppointmentEvent | BaseCalendarEvent;

export type CalendarEventGroupedByTimeInterval = CalendarEvent[];

export type CalendarEventGroupedByDay = {
  [day: string]: CalendarEventGroupedByTimeInterval[];
};

type LoadedEvents = {
  [shopUrl: string]: CalendarEventGroupedByDay;
};

export interface DateRange {
  start_date_time: Date;
  end_date_time: Date;
}

export interface LinkedDateRange extends DateRange {
  id: string;
  shop_id: string;
}

export interface Availability extends DateRange {
  automatic: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly http = inject(HttpService);

  private readonly selectionService = inject(CalendarSelectionService);

  private readonly chatService = inject(ChatService);

  // Signal Definitions
  public readonly loadedEventsSignal = signal<LoadedEvents>({});

  public readonly loadedEventsByIdSignal = computed(() => {
    const res: { [eventId: string]: CalendarEvent } = {};
    const loaded = this.loadedEventsSignal();

    Object.keys(loaded).forEach((shopUrl: string) => {
      Object.keys(loaded[shopUrl]).forEach((day) => {
        loaded[shopUrl][day].forEach((eventByInterval) => {
          eventByInterval.forEach((event) => {
            res[event.id] = event;
          });
        });
      });
    });

    return res;
  });

  private readonly selectedShopUrlSignal = signal<string | null>(null);

  private readonly selectedDateRangeSignal = signal<
    [DateTime, DateTime] | null
  >(null);

  public readonly visibleEventsSignal = computed<CalendarEventGroupedByDay>(
    () => {
      const selectedShopUrl = this.selectedShopUrlSignal();
      const selectedDateRange = this.selectedDateRangeSignal();
      if (!selectedShopUrl || !selectedDateRange) {
        return {};
      }
      const isSelection = this.selectionService.isActive();

      let [startDate, endDate] = selectedDateRange;
      if (isSelection) {
        startDate = DateTime.local().startOf('day');
      }
      if (!this.areEventsLoadedForRange(selectedShopUrl, startDate, endDate)) {
        this.fetchEvents(
          selectedShopUrl,
          startDate.toFormat('yyyy-MM-dd'),
          endDate.toFormat('yyyy-MM-dd')
        );
      }

      const allEventsForShop = this.loadedEventsSignal()[selectedShopUrl] || {};

      return Object.keys(allEventsForShop).reduce(
        (result: CalendarEventGroupedByDay, currentDay) => {
          const dateOfCurrentDay = DateTime.fromISO(currentDay);
          if (dateOfCurrentDay >= startDate && dateOfCurrentDay <= endDate) {
            if (isSelection === 'selection') {
              result[currentDay] = allEventsForShop[currentDay].map(
                (eventsByTimeRange) =>
                  eventsByTimeRange.filter(
                    (event) => event.event_type === 'Availability'
                  )
              );
            } else {
              result[currentDay] = allEventsForShop[currentDay];
            }
          }

          return result;
        },
        {}
      );
    }
  );

  public selectShop(shopId: string) {
    this.selectedShopUrlSignal.set(shopId);
  }

  public updateDateRange(startDate: DateTime, endDate: DateTime) {
    this.selectedDateRangeSignal.set([startDate, endDate]);
  }

  public areEventsLoadedForRange(
    selectedShopId: string,
    startDate: DateTime,
    endDate: DateTime
  ): boolean {
    const shopEvents = this.loadedEventsSignal()[selectedShopId];

    if (shopEvents === undefined) {
      return false;
    }

    let notFound = false;
    let currentDate = startDate;
    while (!notFound && currentDate <= endDate) {
      if (!(currentDate.toFormat('yyyy-MM-dd') in shopEvents)) {
        notFound = true;
        continue;
      }

      currentDate = currentDate.plus({ days: 1 });
    }

    return !notFound;
  }

  public getMinimumAvailabilityDate(shopUrl: string) {
    return this.http.get<string | null>(
      '/calendar/' + shopUrl + '/min-availability-date'
    );
  }

  public add(partialEvent: {
    start_time: string;
    end_time: string;
    event_type: EventType;
    shop_url?: string;
  }) {
    const shopUrl = partialEvent.shop_url ?? this.selectedShopUrlSignal();
    if (!shopUrl) {
      throw new Error('No shop selected');
    }

    const event: Omit<CalendarEvent, 'id'> = {
      ...partialEvent,
      shop_url: shopUrl,
    };

    this.http
      .post<(Availability & LinkedDateRange) | LinkedDateRange>(
        `/calendar/${event.event_type}/add`,
        event
      )
      .subscribe((createdEvent) => {
        this.loadedEventsSignal.update((events) =>
          this.addToObject(events, { ...event, id: createdEvent.id })
        );
      });
  }

  public addProposal(partialEvent: {
    start_time: string;
    end_time: string;
    projectId: string;
  }) {
    this.http
      .post<{ proposal: AppointmentEvent; event: ChatEvent }>(
        `/calendar/proposal`,
        partialEvent
      )
      .subscribe(({ proposal, event }) => {
        this.loadedEventsSignal.update((events) =>
          this.addToObject(events, proposal)
        );

        const chat = this.chatService.activeChatSignal();
        if (chat && chat.id === event.chat_id) {
          this.chatService.addEventsToChat(chat, [event], true);
        }
      });
  }

  public update(event: CalendarEvent, previousStartTime?: string) {
    this.http
      .post(`/calendar/${event.event_type}/update`, event)
      .subscribe(() => {
        this.loadedEventsSignal.update((events) => {
          const result = this.removeFromObject(events, {
            ...event,
            start_time: previousStartTime ?? event.start_time,
          });

          return this.addToObject(result, event);
        });
      });
  }

  public remove(event: CalendarEvent) {
    this.http
      .delete(`/calendar/${event.event_type}/${event.id}`)
      .subscribe(() => {
        this.loadedEventsSignal.update((events) =>
          this.removeFromObject(events, event)
        );
      });
  }

  private addToObject(events: LoadedEvents, event: CalendarEvent) {
    const date = DateTime.fromISO(event.start_time).toFormat('yyyy-MM-dd');

    // Initialize the shop URL and date if they don't already exist
    if (!events[event.shop_url]) {
      events[event.shop_url] = {};
    }
    if (!events[event.shop_url][date]) {
      events[event.shop_url][date] = [];
    }

    // Find the appropriate time interval for the event or create one
    const timeInterval = events[event.shop_url][date].find((interval) =>
      interval.some(
        (e) =>
          e.start_time === event.start_time && e.end_time === event.end_time
      )
    );

    if (timeInterval) {
      timeInterval.push(event);
    } else {
      events[event.shop_url][date].push([event]);
    }

    return events;
  }

  private removeFromObject(events: LoadedEvents, event: CalendarEvent) {
    const date = DateTime.fromISO(event.start_time).toFormat('yyyy-MM-dd');
    const dayEvents = events[event.shop_url][date];

    for (const timeInterval of dayEvents) {
      const indexToRemove = timeInterval.findIndex((e) => e.id === event.id);

      if (indexToRemove !== -1) {
        timeInterval.splice(indexToRemove, 1);

        // Remove empty time intervals
        if (timeInterval.length === 0) {
          const intervalIndex = dayEvents.indexOf(timeInterval);
          dayEvents.splice(intervalIndex, 1);
        }

        break;
      }
    }

    // Remove empty days
    if (dayEvents.length === 0) {
      delete events[event.shop_url][date];
    }

    return events;
  }

  // Fetching Logic
  public fetchEvents(shopId: string, startDate: string, endDate: string) {
    this.http
      .get<CalendarEventGroupedByDay>('/calendar/' + shopId, {
        params: { startDate, endDate },
      })
      .subscribe((events) =>
        this.loadedEventsSignal.update((actual) => {
          return {
            ...actual,
            [shopId]: {
              ...(actual[shopId] || {}),
              ...events,
            },
          };
        })
      );
  }

  public confirmAppointment(appointment: BaseCalendarEvent | CalendarEventV2) {
    const chat = this.chatService.activeChatSignal();
    const projectSignal = chat ? chat.project : null;
    if (!projectSignal) {
      return null;
    }

    return this.http
      .get<CalendarEventGroupedByDay>(
        '/appointment/' + appointment.id + '/accept'
      )
      .subscribe(() =>
        projectSignal.update((project) => {
          if (!project) {
            return null;
          }

          const found = project.appointments?.find(
            (a) => a.id === appointment.id
          );
          if (found) {
            project.plannedDate = found.startTime;
            project.appointments = [
              {
                ...found,
                type: AppointmentStatus.CONFIRMED,
              },
            ];
          } else {
            project.appointments = [];
          }

          return project;
        })
      );
  }

  public rejectAppointment(appointment: BaseCalendarEvent | CalendarEventV2) {
    const chat = this.chatService.activeChatSignal();
    const projectSignal = chat ? chat.project : null;
    if (!projectSignal) {
      return null;
    }

    return this.http
      .get<CalendarEventGroupedByDay>(
        '/appointment/' + appointment.id + '/reject'
      )
      .subscribe(() =>
        projectSignal.update((project) => {
          if (!project) {
            return null;
          }

          project.appointments = project.appointments?.filter(
            (appointment) => appointment.id !== appointment.id
          );

          return project;
        })
      );
  }
}
