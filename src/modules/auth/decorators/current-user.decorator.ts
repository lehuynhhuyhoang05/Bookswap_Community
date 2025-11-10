// src/modules/auth/decorators/current-user.decorator.ts
import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { AuthUser } from '../types/auth-user.type';

export const CurrentUser = createParamDecorator(
  (_: unknown, ctx: ExecutionContext): AuthUser | undefined => {
    const req = ctx.switchToHttp().getRequest();
    const u = req.user;
    if (!u) return undefined;
    return {
      sub: u.sub ?? u.userId,
      userId: u.userId ?? u.sub,
      email: u.email,
      role: u.role,
      memberId: u.memberId ?? u.member?.member_id,
    };
  },
);
