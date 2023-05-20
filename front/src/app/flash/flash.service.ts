import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Flash {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  available: boolean;
  price_range_start?: number;
  price_range_end?: number;
}

@Injectable({
  providedIn: 'root',
})
export class FlashService {
  private readonly http = inject(HttpClient);

  public create(formData: FormData) {
    return this.http.post<void>('/flash/create', formData);
  }

  public getMine() {
    return this.http.get<Flash[]>('/flash');
  }

  public get(shopId: string) {
    return this.http.get<Flash[]>('/flash/' + shopId);
  }

  public update(formData: FormData) {
    return this.http.post<void>('/flash/update', formData);
  }
}
