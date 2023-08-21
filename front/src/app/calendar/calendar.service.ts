import { Injectable, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpService } from '@app/@core/http/http.service';
import { DateTime } from 'luxon';

export type EventType = 'Appointment' | 'Availability' | 'Unavailability';

export type CalendarEvent = {
  id: string;
  start_time: Date;
  end_time: Date;
  event_type: EventType;
};

export type CalendarEventGroupedByDay = {
  [day: string]: CalendarEvent[];
};

@Injectable({
  providedIn: 'root',
})
export class CalendarService {
  private readonly http = inject(HttpService);

  // Signal Definitions
  public readonly loadedEventsSignal = signal<{
    [shopUrl: string]: CalendarEventGroupedByDay;
  }>({});

  private readonly selectedShopIdSignal = signal<string | null>(null);

  private readonly selectedDateRangeSignal = signal<
    [DateTime, DateTime] | null
  >(null);

  public readonly visibleEventsSignal = computed<CalendarEventGroupedByDay>(
    () => {
      const selectedShopId = this.selectedShopIdSignal();
      const selectedDateRange = this.selectedDateRangeSignal();
      if (!selectedShopId || !selectedDateRange) {
        return {};
      }

      const [startDate, endDate] = selectedDateRange;
      if (!this.areEventsLoadedForRange(selectedShopId, startDate, endDate)) {
        this.fetchEvents(
          selectedShopId,
          startDate.toFormat('yyyy-MM-dd'),
          endDate.toFormat('yyyy-MM-dd')
        );
      }

      const allEventsForShop = this.loadedEventsSignal()[selectedShopId] || {};

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
    this.selectedShopIdSignal.set(shopId);
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
