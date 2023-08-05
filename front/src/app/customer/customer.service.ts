import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { Shop } from '@app/shop/shop.service';
import { map, tap } from 'rxjs';

export interface Customer {
  id: string;
  supertokens_id: string;
  creation_date: Date;
  last_update: Date;
  email: string;
  firstname?: string;
  lastname?: string;
  birthday?: Date;
  got_profile_picture: boolean;
  profile_picture_version?: string;
  pronouns?: string;
  phone?: string;
  instagram?: string;
  twitter?: string;
  personal_information?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  private readonly credentialsService = inject(CredentialsService);

  public getCredentials(userId: string) {
    return this.http.get<any>(`/customer/credentials/${userId}`);
  }

  public getMine() {
    return this.http.get<Customer>(`/customer/`).pipe(
      map((customer) => {
        console.log(customer.birthday);
        return {
          ...customer,
          birthday: customer.birthday && new Date(customer.birthday),
        };
      })
    );
  }

  // public get(userId: string) {
  //   return this.http.get<Customer>(`/customer/${userId}`);
  // }

  public update(formData: FormData) {
    return this.http
      .post<Shop>('/customer', formData)
      .pipe(tap(() => this.credentialsService.refreshCredentials()));
  }
}
