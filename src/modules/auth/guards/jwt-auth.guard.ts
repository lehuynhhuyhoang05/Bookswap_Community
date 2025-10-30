// src/modules/auth/guards/jwt-auth.guard.ts
import { ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../../../common/decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) { super(); }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    const req = context.switchToHttp().getRequest();
    console.log('[GUARD] canActivate', {
      url: req.originalUrl || req.url,
      isPublic,
      hasAuthHeader: !!req.headers?.authorization,
    });
    if (isPublic) return true;
    return super.canActivate(context);
  }

  handleRequest(err: any, user: any, info: any, context: ExecutionContext, status?: any) {
    const req = context.switchToHttp().getRequest();
    console.log('[GUARD] handleRequest', {
      url: req.originalUrl || req.url,
      err: err?.message,
      info: info?.message || info,
      user: user ? { sub: user.sub, email: user.email, role: user.role } : null,
    });
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
