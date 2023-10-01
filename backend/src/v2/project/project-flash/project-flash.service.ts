import { Injectable } from '@nestjs/common';
import { ProjectFlashSchema } from './project-flash.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class ProjectFlashService {
  constructor(
    @InjectRepository(ProjectFlashSchema)
    private projectRepository: Repository<ProjectFlashSchema>,
  ) {}

  async getAll(projectId: string) {
    const projectFlashs = await this.projectRepository.find({
      where: { projectId },
      relations: ['flash'],
    });

    return projectFlashs.map((projectFlash) => projectFlash.flash);
  }
}
