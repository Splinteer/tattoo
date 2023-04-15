import { TestBed } from '@angular/core/testing';

import { SupertokensService } from './supertokens.service';

describe('SupertokensService', () => {
  let service: SupertokensService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SupertokensService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
