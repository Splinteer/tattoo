import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFlashController } from './project-flash.controller';

describe('ProjectFlashController', () => {
  let controller: ProjectFlashController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectFlashController],
    }).compile();

    controller = module.get<ProjectFlashController>(ProjectFlashController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
