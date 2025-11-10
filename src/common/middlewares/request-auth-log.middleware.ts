// src/common/middlewares/request-auth-log.middleware.ts
import { Injectable, NestMiddleware } from '@nestjs/common';

@Injectable()
export class RequestAuthLogMiddleware implements NestMiddleware {
  use(req: any, res: any, next: () => void) {
    const auth = req.headers?.authorization || '';
    const sample = auth.length > 30 ? auth.slice(0, 30) + '...' : auth;
    console.log('[AUTH-HEADERS]', {
      method: req.method,
      url: req.originalUrl || req.url,
      authorizationSample: sample, // kỳ vọng: "Bearer eyJ..."
    });
    next();
  }
}
