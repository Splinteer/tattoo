import { Injectable } from '@angular/core';
import { makeStateKey, TransferState } from '@angular/platform-browser';

export interface Credentials {}

@Injectable({
  providedIn: 'root',
})
export class CredentialsService {
  private stateKey = makeStateKey<Credentials>('client');

  public credentials: Credentials | null = null;

  constructor(private transferState: TransferState) {
    this.credentials = transferState.get(this.stateKey, null);
  }

  public isAuthenticated(): boolean {
    return !!this.credentials;
  }

  public set(credentials: Credentials) {
    this.credentials = credentials;
    this.transferState.set(this.stateKey, credentials);
  }

  public remove() {
    this.transferState.remove(this.stateKey);
  }
}
