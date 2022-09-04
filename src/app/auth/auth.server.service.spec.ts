/* tslint:disable:no-unused-variable */

import { TestBed, async, inject } from '@angular/core/testing';
import { Auth.serverService } from './auth.server.service';

describe('Service: Auth.server', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [Auth.serverService]
    });
  });

  it('should ...', inject([Auth.serverService], (service: Auth.serverService) => {
    expect(service).toBeTruthy();
  }));
});
