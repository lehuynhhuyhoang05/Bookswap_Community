// src/common/filters/api-exception.filter.ts
/**
 * Custom Exception Filter for standardized error responses
 * Converts all exceptions into standardized ApiResponseDto format
 */

import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { ValidationError } from 'class-validator';
import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { ApiResponseDto, ApiErrorFactory, ApiErrorDetailDto } from '../dto/api-response.dto';
import { ErrorCode, ERROR_CODE_TO_HTTP_STATUS } from '../enums/error-code.enum';

@Catch()
export class ApiExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(ApiExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    const response = ctx.getResponse<Response>();
    const request_id = uuidv4();

    let status: number;
    let errorResponse: any;

    // Log the exception
    this.logger.error(`[${request_id}] ${request.method} ${request.path}`, {
      error: exception instanceof Error ? exception.message : String(exception),
      stack: exception instanceof Error ? exception.stack : undefined,
    });

    // ============================================================
    // Handle class-validator ValidationError[]
    // ============================================================
    if (Array.isArray(exception) && exception[0] instanceof ValidationError) {
      const validationErrors = exception as ValidationError[];
      const details = this.formatValidationErrors(validationErrors);

      status = HttpStatus.BAD_REQUEST;
      errorResponse = ApiResponseDto.error(
        ApiErrorFactory.validationError(details, request_id),
        request_id,
      );
    }
    // ============================================================
    // Handle HttpException (400, 401, 403, 404, 409, etc.)
    // ============================================================
    else if (exception instanceof HttpException) {
      const httpResponse = exception.getResponse();
      const errorCode = this.extractErrorCode(httpResponse);

      status = exception.getStatus();
      const message =
        typeof httpResponse === 'object'
          ? (httpResponse as any).message || exception.message
          : exception.message;

      errorResponse = ApiResponseDto.error(
        ApiErrorFactory.createError(errorCode, message, undefined, request_id),
        request_id,
      );
    }
    // ============================================================
    // Handle generic Error
    // ============================================================
    else if (exception instanceof Error) {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = ApiResponseDto.error(
        ApiErrorFactory.internalError(exception.message, request_id),
        request_id,
      );
    }
    // ============================================================
    // Handle unknown exception
    // ============================================================
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      errorResponse = ApiResponseDto.error(
        ApiErrorFactory.internalError('Unknown error occurred', request_id),
        request_id,
      );
    }

    response.status(status).json(errorResponse);
  }

  /**
   * Convert class-validator ValidationError[] to ApiErrorDetailDto[]
   */
  private formatValidationErrors(
    validationErrors: ValidationError[],
  ): ApiErrorDetailDto[] {
    const details: ApiErrorDetailDto[] = [];

    const flatten = (errors: ValidationError[], path = '') => {
      errors.forEach((error) => {
        const currentPath = path ? `${path}.${error.property}` : error.property;

        if (error.constraints) {
          // Get first validation error message
          const message = Object.values(error.constraints)[0];
          details.push({
            field: currentPath,
            message,
            code: Object.keys(error.constraints)[0],
            value: error.value,
          });
        }

        if (error.children && error.children.length > 0) {
          flatten(error.children, currentPath);
        }
      });
    };

    flatten(validationErrors);
    return details;
  }

  /**
   * Extract ErrorCode from HTTP response
   */
  private extractErrorCode(httpResponse: any): ErrorCode | string {
    // If already has error_code in response
    if (httpResponse.error_code) {
      return httpResponse.error_code;
    }

    // Try to map common error messages to ErrorCodes
    const message = httpResponse.message?.toLowerCase() || '';

    if (message.includes('unauthorized')) return ErrorCode.UNAUTHORIZED;
    if (message.includes('forbidden')) return ErrorCode.FORBIDDEN;
    if (message.includes('not found')) return ErrorCode.MEMBER_NOT_FOUND;
    if (message.includes('duplicate')) return ErrorCode.DUPLICATE_REQUEST;
    if (message.includes('validation')) return ErrorCode.VALIDATION_ERROR;

    return ErrorCode.INVALID_INPUT;
  }
}
