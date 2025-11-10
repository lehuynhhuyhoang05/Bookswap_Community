// src/common/filters/http-exception-log.filter.ts
import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';

@Catch()
export class HttpExceptionLogFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const req = ctx.getRequest();
    const res = ctx.getResponse();

    const status = exception instanceof HttpException ? exception.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
    const resp = exception instanceof HttpException ? exception.getResponse() : exception?.message || exception;

    console.error('[EXCEPTION]', {
      url: req.originalUrl || req.url,
      status,
      resp,
      stack: exception?.stack?.split('\n').slice(0, 5).join('\n'),
    });

    res.status(status).json(
      typeof resp === 'object' ? resp : { statusCode: status, message: String(resp) },
    );
  }
}
