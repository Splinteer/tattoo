import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Flash {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  image_version: number;
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

  public getMine(lastDate?: Date, limit?: number) {
    return this.http.post<Flash[]>('/flash', { lastDate, limit });
  }

  public get(flashId: string) {
    return this.http.get<Flash>('/flash/' + flashId);
  }

  public getByShop(shopId: string, lastDate?: Date, limit?: number) {
    return this.http.post<Flash[]>('/flash/shop/' + shopId, {
      lastDate,
      limit,
    });
  }

  public update(id: string, formData: FormData) {
    return this.http.post<void>('/flash/' + id, formData);
  }

  public delete(id: string) {
    return this.http.delete<void>('/flash/' + id);
  }
}
