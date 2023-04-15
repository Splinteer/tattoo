import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  private readonly http = inject(HttpClient);

  public getCustomerInfo(userId: string) {
    return this.http.get<any>(`/customer/${userId}`);
  }
}
