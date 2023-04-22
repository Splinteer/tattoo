import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Session from 'supertokens-auth-react/recipe/session';

interface Customer {
  id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  profile_picture?: string;
}

@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  public readonly credentialsSubject$ = new BehaviorSubject<Customer | null>(
    null
  );

  public readonly credentials$ = this.credentialsSubject$.asObservable();

  public readonly refreshCredentials$ = new Subject<void>();

  public async logOut(refresh = false): Promise<void> {
    try {
      await Session.signOut();
      this.credentialsSubject$.next(null);
      if (refresh) {
        window.location.reload();
      }
    } catch (error) {
      console.error(error);
      const test = await Session.doesSessionExist();
      await Session.signOut();
    }
  }

  public refreshCredentials(): void {
    this.refreshCredentials$.next();
  }
}
