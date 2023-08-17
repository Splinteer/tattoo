import { Injectable, inject } from '@angular/core';
import { HttpService } from '@app/@core/http/http.service';

export enum Weekday {
  Monday = 1,
  Tuesday,
  Wednesday,
  Thursday,
  Friday,
  Saturday,
  Sunday,
}

export interface HourRange {
  startTime: string;
  endTime: string;
}

export interface DayAvailability {
  startDay: Weekday;
  endDay: Weekday;
  hourRanges: HourRange[];
}

export interface DefaultAvailability {
  shopId: string;
  startDay: string;
  endDay: string;
  startTime: string;
  endTime: string;
}

export interface DayGroupedDefaultAvailability {
  startDay: Weekday;
  endDay: Weekday;
  hourRanges: {
    startTime: string;
    endTime: string;
  }[];
}

@Injectable({
  providedIn: 'root',
})
export class AvailabilityService {
  private readonly http = inject(HttpService);

  public getDefaultAvailability() {
    return this.http.get<DayGroupedDefaultAvailability[]>(
      '/default-availability'
    );
  }

  public updateDefaultAvailability(data: DayAvailability[]) {
    return this.http.post<void>('/default-availability', data);
  }
}
