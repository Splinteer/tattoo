import { HttpClient } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { CredentialsService } from '@app/auth/credentials.service';
import { tap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ShopService {
  private readonly http = inject(HttpClient);

  private readonly credentialsService = inject(CredentialsService);

  public create(formData: FormData) {
    return this.http
      .post('/shop/create', formData)
      .pipe(tap(() => this.credentialsService.refreshCredentials()));
  }
}
