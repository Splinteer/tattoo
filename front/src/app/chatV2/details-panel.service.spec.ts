import { TestBed } from '@angular/core/testing';

import { DetailsPanelService } from './details-panel.service';

describe('DetailsPanelService', () => {
  let service: DetailsPanelService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DetailsPanelService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
