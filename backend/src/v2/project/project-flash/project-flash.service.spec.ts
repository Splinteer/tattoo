import { Test, TestingModule } from '@nestjs/testing';
import { ProjectFlashService } from './project-flash.service';

describe('ProjectFlashService', () => {
  let service: ProjectFlashService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProjectFlashService],
    }).compile();

    service = module.get<ProjectFlashService>(ProjectFlashService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
