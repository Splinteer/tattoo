import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Patch,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiUnauthorizedResponse,
  ApiBearerAuth,
  ApiOkResponse,
  ApiForbiddenResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { AuthGuard } from 'src/v1/auth/auth.guard';
import { ProjectService } from './project.service';
import { ProjectPatchDTO, ProjectState } from './dto/project-patch.dto';
import { ProjectGuard } from './project.guard';
import { GuardRole } from '@app/common/decorators/guard-role.decorator';
import { UUIDParam } from '@app/common/decorators/uuid-param.decorator';

@ApiTags('project')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiBearerAuth()
@UseGuards(new AuthGuard())
@Controller({
  path: 'projects',
  version: '2',
})
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}

  // @ApiOkResponse({ description: 'Returns all projects' })
  // @Get()
  // getAll(
  //   @Credentials()
  //   credentials: ICredentials,
  // ) {
  //   return this.projectService.getAll(credentials.id);
  // }

  @ApiOkResponse({ description: 'Returns a project' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Get(':id')
  @UseGuards(ProjectGuard)
  getProject(
    @GuardRole('projectRole') role: string,
    @UUIDParam('id') id: string,
  ) {
    return this.projectService.getById(id);
  }

  @ApiOkResponse({ description: 'Delete an appointment' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
  @ApiBadRequestResponse({ description: 'Bad request' })
  @Patch(':id')
  @UseGuards(ProjectGuard)
  updateProject(
    @GuardRole('projectRole') role: string,
    @UUIDParam('id') id: string,
    @Body() body: ProjectPatchDTO,
  ) {
    if (body.state === ProjectState.PAID) {
      if (role !== 'shop') {
        throw new ForbiddenException();
      }

      return this.projectService.setPaid(id);
    }

    if (body.customer_rating) {
      if (role !== 'customer') {
        throw new ForbiddenException();
      }

      return this.projectService.setCustomerRating(id, body.customer_rating);
    }

    if (body.shop_rating) {
      if (role !== 'shop') {
        throw new ForbiddenException();
      }

      return this.projectService.setShopRating(id, body.shop_rating);
    }

    throw new BadRequestException();
  }
}
