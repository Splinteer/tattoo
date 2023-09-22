import { Test, TestingModule } from '@nestjs/testing';
import { DefaultAvailabilityController } from './default-availability.controller';

describe('DefaultAvailabilityController', () => {
  let controller: DefaultAvailabilityController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DefaultAvailabilityController],
    }).compile();

    controller = module.get<DefaultAvailabilityController>(DefaultAvailabilityController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
