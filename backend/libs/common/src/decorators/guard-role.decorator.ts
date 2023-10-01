import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const GuardRole = createParamDecorator(
  (rolePropertyName: string, ctx: ExecutionContext): string => {
    const request = ctx.switchToHttp().getRequest();
    return request[rolePropertyName];
  },
);
