import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { tap } from 'rxjs';

export interface Shop {
  id: string; // UUID
  owner_id: string; // UUID (foreign key referencing public.customer)
  creation_date: string;
  last_update: string;
  name: string;
  url: string;
  description: string;
  got_profile_picture: boolean;
  profile_picture_version: number;
  country: string | null;
  instagram: string | null;
  twitter: string | null;
  facebook: string | null;
  website: string | null;
}

export interface ShopWithRating extends Shop {
  note: string;
  appointments: number;
}

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly http = inject(HttpClient);

  private readonly credentialsService = inject(CredentialsService);

  public create(formData: FormData) {
    return this.http
      .post<Shop>('/shop/create', formData)
      .pipe(tap(() => this.credentialsService.refreshCredentials()));
  }

  public get() {
    return this.http.get<Shop>('/shop');
  }

  public getByUrl(url: string) {
    return this.http.get<ShopWithRating>('/shop/' + url);
  }

  public update(formData: FormData) {
    return this.http
      .post<Shop>('/shop/update', formData)
      .pipe(tap(() => this.credentialsService.refreshCredentials()));
  }
}
