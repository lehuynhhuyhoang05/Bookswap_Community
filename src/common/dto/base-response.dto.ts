import { ApiProperty } from '@nestjs/swagger';

export class BaseResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'Operation successful' })
  message: string;

  @ApiProperty()
  data?: T;

  @ApiProperty({ example: null })
  error?: any;

  constructor(success: boolean, message: string, data?: T, error?: any) {
    this.success = success;
    this.message = message;
    this.data = data;
    this.error = error;
  }

  static success<T>(message: string, data?: T): BaseResponseDto<T> {
    return new BaseResponseDto(true, message, data);
  }

  static error(message: string, error?: any): BaseResponseDto<null> {
    return new BaseResponseDto(false, message, null, error);
  }
}

export class PaginationMetaDto {
  @ApiProperty({ example: 1 })
  currentPage: number;

  @ApiProperty({ example: 10 })
  itemsPerPage: number;

  @ApiProperty({ example: 100 })
  totalItems: number;

  @ApiProperty({ example: 10 })
  totalPages: number;

  @ApiProperty({ example: true })
  hasNextPage: boolean;

  @ApiProperty({ example: false })
  hasPreviousPage: boolean;
}

export class PaginatedResponseDto<T> extends BaseResponseDto<T[]> {
  @ApiProperty()
  meta: PaginationMetaDto;

  constructor(
    success: boolean,
    message: string,
    data: T[],
    meta: PaginationMetaDto,
  ) {
    super(success, message, data);
    this.meta = meta;
  }

  static paginated<T>(
    message: string,
    data: T[],
    meta: PaginationMetaDto,
  ): PaginatedResponseDto<T> {
    return new PaginatedResponseDto(true, message, data, meta);
  }
}