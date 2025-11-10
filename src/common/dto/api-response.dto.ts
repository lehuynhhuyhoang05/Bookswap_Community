// src/common/dto/api-response.dto.ts
/**
 * Standard API Response DTOs for consistent response format across all endpoints
 */

import { ErrorCode } from '../enums/error-code.enum';

export class PaginationDto {
  page: number;
  limit: number;
  total: number;
  has_next: boolean;
  has_prev: boolean;
  total_pages: number;
}

export class ApiErrorDetailDto {
  field?: string;
  message: string;
  code?: string;
  value?: any;
}

export class ApiErrorDto {
  code: ErrorCode | string;
  message: string;
  details?: ApiErrorDetailDto[];
  request_id?: string;
  timestamp: string;
}

export class ApiResponseDto<T = any> {
  success: boolean;
  data?: T;
  error?: ApiErrorDto;
  pagination?: PaginationDto;
  timestamp: string;
  request_id?: string;

  constructor(
    success: boolean,
    data?: T,
    error?: ApiErrorDto,
    pagination?: PaginationDto,
    request_id?: string,
  ) {
    this.success = success;
    this.data = data;
    this.error = error;
    this.pagination = pagination;
    this.timestamp = new Date().toISOString();
    this.request_id = request_id;
  }

  static success<T>(
    data: T,
    pagination?: PaginationDto,
    request_id?: string,
  ): ApiResponseDto<T> {
    return new ApiResponseDto(true, data, undefined, pagination, request_id);
  }

  static error(
    error: ApiErrorDto,
    request_id?: string,
  ): ApiResponseDto {
    return new ApiResponseDto(false, undefined, error, undefined, request_id);
  }

  static pagination<T>(
    data: T[],
    total: number,
    page: number,
    limit: number,
    request_id?: string,
  ): ApiResponseDto<T[]> {
    const total_pages = Math.ceil(total / limit);
    const pagination: PaginationDto = {
      page,
      limit,
      total,
      total_pages,
      has_next: page < total_pages,
      has_prev: page > 1,
    };
    return new ApiResponseDto(true, data, undefined, pagination, request_id);
  }
}

/**
 * Factory class for creating standardized error responses
 */
export class ApiErrorFactory {
  static createError(
    code: ErrorCode | string,
    message: string,
    details?: ApiErrorDetailDto[],
    request_id?: string,
  ): ApiErrorDto {
    return {
      code,
      message,
      details,
      request_id,
      timestamp: new Date().toISOString(),
    };
  }

  static validationError(
    details: ApiErrorDetailDto[],
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(
      ErrorCode.VALIDATION_ERROR,
      'Validation failed',
      details,
      request_id,
    );
  }

  static notFound(
    message: string,
    code: ErrorCode | string = ErrorCode.MEMBER_NOT_FOUND,
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(code, message, undefined, request_id);
  }

  static forbidden(
    message: string,
    code: ErrorCode | string = ErrorCode.FORBIDDEN,
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(code, message, undefined, request_id);
  }

  static badRequest(
    message: string,
    code: ErrorCode | string = ErrorCode.INVALID_INPUT,
    details?: ApiErrorDetailDto[],
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(code, message, details, request_id);
  }

  static conflict(
    message: string,
    code: ErrorCode | string = ErrorCode.DUPLICATE_REQUEST,
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(code, message, undefined, request_id);
  }

  static internalError(
    message: string = 'Internal server error',
    request_id?: string,
  ): ApiErrorDto {
    return this.createError(
      ErrorCode.INTERNAL_SERVER_ERROR,
      message,
      undefined,
      request_id,
    );
  }
}
