import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';
import { DateTime } from 'luxon';
import { CalendarSelectionService } from './calendar-selection.service';

export type EventType = 'Appointment' | 'Availability' | 'Unavailability';

export type CalendarEvent = {
  id: string;
  shop_url: string;
  start_time: string;
  end_time: string;
  event_type: EventType;
};

export type CalendarEventGroupedByDay = {
  [day: string]: CalendarEvent[];
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

  // Signal Definitions
  public readonly loadedEventsSignal = signal<LoadedEvents>({});

  public readonly loadedEventsByIdSignal = computed(() => {
    const res: { [eventId: string]: CalendarEvent } = {};
    const loaded = this.loadedEventsSignal();

    Object.keys(loaded).forEach((shopUrl: string) => {
      Object.keys(loaded[shopUrl]).forEach((day) => {
        loaded[shopUrl][day].forEach((event) => {
          res[event.id] = event;
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
            result[currentDay] = allEventsForShop[currentDay];
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
    if (!(event.shop_url in events)) {
      events[event.shop_url] = { [date]: [] };
    } else if (!(event.shop_url in events)) {
      events[event.shop_url][date] = [];
    }

    events[event.shop_url][date].push(event);

    return events;
  }

  private removeFromObject(events: LoadedEvents, event: CalendarEvent) {
    const dayEvents =
      events[event.shop_url][
        DateTime.fromISO(event.start_time).toFormat('yyyy-MM-dd')
      ];

    const indexToRemove = dayEvents.findIndex((value) => value.id === event.id);
    dayEvents.splice(indexToRemove, 1);

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
}
