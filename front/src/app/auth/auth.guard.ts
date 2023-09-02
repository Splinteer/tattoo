import { Injectable, inject } from '@angular/core';
import { UrlTree } from '@angular/router';
import { CredentialsService } from '@app/auth/credentials.service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthGuard {
  private readonly credentialsService = inject(CredentialsService);

  canActivate():
    | Observable<boolean | UrlTree>
    | Promise<boolean | UrlTree>
    | boolean
    | UrlTree {
    return this.credentialsService.credentialsSubject$.getValue() !== null;
  }
}
