import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import Session from 'supertokens-auth-react/recipe/session';

@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  public readonly credentialsSubject$ = new BehaviorSubject<any>(null);

  public readonly credentials$ = this.credentialsSubject$.asObservable();

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
}
