import { Test, TestingModule } from '@nestjs/testing';
import { EventNotificationService } from './notification.service';

describe('ChatNotificationService', () => {
  let service: EventNotificationService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EventNotificationService],
    }).compile();

    service = module.get<EventNotificationService>(EventNotificationService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
