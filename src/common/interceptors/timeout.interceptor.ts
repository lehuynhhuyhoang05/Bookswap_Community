// src/common/interceptors/timeout.interceptor.ts
import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  RequestTimeoutException,
  Logger,
} from '@nestjs/common';
import { Observable, throwError, TimeoutError } from 'rxjs';
import { catchError, timeout } from 'rxjs/operators';

@Injectable()
export class TimeoutInterceptor implements NestInterceptor {
  private readonly logger = new Logger(TimeoutInterceptor.name);
  
  constructor(private readonly timeoutMs: number = 30000) {} // 30 giây mặc định

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url } = request;
    
    this.logger.debug(`[${method}] ${url} - Setting timeout: ${this.timeoutMs}ms`);
    
    return next.handle().pipe(
      timeout(this.timeoutMs),
      catchError(err => {
        if (err instanceof TimeoutError) {
          this.logger.error(
            `[${method}] ${url} - Request timeout after ${this.timeoutMs}ms`
          );
          return throwError(() => 
            new RequestTimeoutException(
              `Request timeout after ${this.timeoutMs}ms`
            )
          );
        }
        return throwError(() => err);
      }),
    );
  }
}