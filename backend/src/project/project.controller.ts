import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectService } from './project.service';
import { Credentials as ICredentials } from 'src/auth/credentials/credentials.service';
import { AuthGuard } from 'src/auth/auth.guard';
import { Credentials } from 'src/auth/session/session.decorator';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  @Get(':id')
  @UseGuards(new AuthGuard())
  getProject(
    @Credentials()
    credentials: ICredentials,
    @Param('id') id: string,
  ) {
    return this.projectService.get(id);
  }
}
