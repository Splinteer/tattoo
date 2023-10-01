import {
  BadRequestException,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ProjectService } from './project.service';
import { Credentials as ICredentials } from 'src/v1/auth/credentials/credentials.service';
import { getSession } from 'supertokens-node/recipe/session';
import { validate as validateUUID } from 'uuid';
import { Request } from 'express';

interface RequestWithProjectRole extends Request {
  projectRole: string;
}

@Injectable()
export class ProjectGuard implements CanActivate {
  constructor(private readonly projectService: ProjectService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const params = request.params;
    const projectId = params.projectId || params.id;

    try {
      const session = await getSession(request, response);
      const credentials = session.getAccessTokenPayload()
        .credentials as ICredentials;

      return this.validateAccess(request, credentials, projectId);
    } catch (error) {
      if (error.type === 'UNAUTHORISED') {
        throw new ForbiddenException();
      }

      throw error;
    }
  }

  async validateAccess(
    request: RequestWithProjectRole,
    user: ICredentials,
    projectId: string,
  ): Promise<boolean> {
    if (!validateUUID(projectId)) {
      throw new BadRequestException('Invalid project ID');
    }

    const project = await this.projectService.getById(projectId);
    if (!project) {
      throw new UnauthorizedException('Project not found');
    }

    const role = await this.projectService.canAccess(
      project,
      user.id,
      user.shop_id,
    );

    if (role === 'unauthorised') {
      throw new UnauthorizedException(
        'You do not have permission to access this project',
      );
    }

    request.projectRole = role;

    return true;
  }
}
