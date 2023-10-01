import { Test, TestingModule } from '@nestjs/testing';
import { ProjectAppointmentController } from './project-appointment.controller';

describe('ProjectAppointmentController', () => {
  let controller: ProjectAppointmentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProjectAppointmentController],
    }).compile();

    controller = module.get<ProjectAppointmentController>(ProjectAppointmentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
