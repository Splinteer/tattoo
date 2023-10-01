import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ProjectFlashService } from './project-flash.service';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { ProjectGuard } from '../project.guard';

@Controller('project-flash')
export class ProjectFlashController {}

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard(), ProjectGuard)
@Controller({
  path: 'projects/:id/flashs',
  version: '2',
})
export class ProjectController {
  constructor(private readonly projectFlashService: ProjectFlashService) {}

  @ApiOkResponse({ description: 'Returns all project flashs' })
  @Get()
  getAll(@Param('projectId') projectId: string) {
    return this.projectFlashService.getAll(projectId);
  }
}
