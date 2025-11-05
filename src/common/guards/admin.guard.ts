// ============================================================
// src/common/guards/admin.guard.ts
// Guard bảo vệ các endpoint chỉ dành cho ADMIN
// ============================================================
import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    // Kiểm tra user có tồn tại không
    if (!user) {
      throw new ForbiddenException('Unauthorized access');
    }

    // Kiểm tra role có phải ADMIN không
    if (user.role !== 'ADMIN') {
      throw new ForbiddenException('Admin access required');
    }

    return true;
  }
}
