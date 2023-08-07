import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import Session from 'supertokens-auth-react/recipe/session';

export interface Credentials {
  id: string;
  supertokens_id: string;
  email: string;
  firstname?: string;
  lastname?: string;
  got_profile_picture?: boolean;
  profile_picture_version?: number;

  // Shop
  shop_id?: string;
  shop_name?: string;
  shop_url?: string;
  shop_got_picture?: boolean;
  shop_image_version?: number;
}

@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  public readonly credentialsSubject$ = new BehaviorSubject<Credentials | null>(
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
