import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Flash {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description: string | null;
  image_url: string;
  available: boolean;
  price_range_start: number | null;
  price_range_end: number | null;
}

@Injectable({
  providedIn: 'root',
})
export class FlashService {
  private readonly http = inject(HttpClient);

  public create(formData: FormData) {
    return this.http.post<Flash>('/flash/create', formData);
  }

  public get() {
    return this.http.get<Flash>('/flash');
  }

  public update(formData: FormData) {
    return this.http.post<Flash>('/flash/update', formData);
  }
}
