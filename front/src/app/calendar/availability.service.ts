import { Injectable, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { HttpService } from '@app/@core/http/http.service';
import {
  AutomaticAvailabilityTimeUnit,
  ShopService,
} from '@app/shop/shop.service';
import { map } from 'rxjs';

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
  startDay: number;
  endDay: number;
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

  private readonly shopService = inject(ShopService);

  public readonly settings = toSignal(
    this.shopService.get().pipe(
      map((shop) => ({
        auto_generate_availability: shop.auto_generate_availability,
        repeat_availability_every: shop.repeat_availability_every,
        repeat_availability_time_unit: shop.repeat_availability_time_unit,
        min_appointment_time: shop.min_appointment_time,
      }))
    )
  );

  public updateSettings(settings: {
    auto_generate_availability: boolean;
    repeat_availability_every: number;
    repeat_availability_time_unit: AutomaticAvailabilityTimeUnit;
    min_appointment_time: number;
  }) {
    return this.http.post<void>('/availability/settings', settings);
  }

  public getDefaultAvailability() {
    return this.http.get<DayGroupedDefaultAvailability[]>(
      '/default-availability'
    );
  }

  public updateDefaultAvailability(data: DayAvailability[]) {
    return this.http.post<void>('/default-availability', data);
  }

  public generateAvailability(data: { start_day: string; end_day: string }) {
    return this.http.post<void>('/availability/generate', data);
  }
}
