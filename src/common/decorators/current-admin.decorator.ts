// ============================================================
// src/common/decorators/current-admin.decorator.ts
// Decorator lấy thông tin admin từ request
// ============================================================
import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export const CurrentAdmin = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return request.user; // Từ JwtAuthGuard
  },
);
