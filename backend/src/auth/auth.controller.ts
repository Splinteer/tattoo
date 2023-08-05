import { Controller, Get, Param } from '@nestjs/common';
import { CredentialsService } from './credentials/credentials.service';

@Controller('auth')
export class AuthController {
  constructor(private readonly credentialsService: CredentialsService) {}

  @Get('credentials/:userId')
  public getCredentials(@Param('userId') userId: string) {
    return this.credentialsService.get(userId);
  }
}
