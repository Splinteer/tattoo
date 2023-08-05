import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

export interface Gallery {
  id: string;
  shop_id: string;
  creation_date: Date;
  name: string;
  description?: string;
  image_url: string;
  image_version: number;
}

@Injectable({
  providedIn: 'root',
})
export class GalleryService {
  private readonly http = inject(HttpClient);

  public create(formData: FormData) {
    return this.http.post<void>('/gallery/create', formData);
  }

  public getMine(lastDate?: Date, limit?: number) {
    return this.http.post<Gallery[]>('/gallery', { lastDate, limit });
  }

  public get(galleryId: string) {
    return this.http.get<Gallery>('/gallery/' + galleryId);
  }

  public getByShop(shopId: string, lastDate?: Date, limit?: number) {
    return this.http.post<Gallery[]>('/gallery/shop/' + shopId, {
      lastDate,
      limit,
    });
  }

  public update(id: string, formData: FormData) {
    return this.http.post<void>('/gallery/' + id, formData);
  }

  public delete(id: string) {
    return this.http.delete<void>('/gallery/' + id);
  }
}
