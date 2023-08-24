import { Test, TestingModule } from '@nestjs/testing';
import { DefaultAvailabilityService } from './default-availability.service';

describe('DefaultAvailabilityService', () => {
  let service: DefaultAvailabilityService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DefaultAvailabilityService],
    }).compile();

    service = module.get<DefaultAvailabilityService>(DefaultAvailabilityService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
