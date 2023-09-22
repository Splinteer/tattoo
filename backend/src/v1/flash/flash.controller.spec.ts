import { Test, TestingModule } from '@nestjs/testing';
import { FlashController } from './flash.controller';

describe('FlashController', () => {
  let controller: FlashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FlashController],
    }).compile();

    controller = module.get<FlashController>(FlashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
