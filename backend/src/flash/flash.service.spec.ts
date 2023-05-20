import { Test, TestingModule } from '@nestjs/testing';
import { FlashService } from './flash.service';

describe('FlashService', () => {
  let service: FlashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [FlashService],
    }).compile();

    service = module.get<FlashService>(FlashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
