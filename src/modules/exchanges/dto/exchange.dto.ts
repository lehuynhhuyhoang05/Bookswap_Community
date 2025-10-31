import {
  IsString,
  IsArray,
  IsUUID,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExchangeRequestStatus } from '../../../infrastructure/database/entities/exchange-request.entity';

// ==================== CREATE EXCHANGE REQUEST ====================
export class CreateExchangeRequestDto {
  @ApiProperty({
    description: 'ID of the member you want to exchange with',
    example: 'c1d2e3f4-a5b6-7890-cdef-1234567890ab',
  })
  @IsUUID()
  @IsNotEmpty()
  receiver_id: string;

  @ApiProperty({
    description: 'Books you are offering (from your library)',
    type: [String],
    example: ['book-uuid-1', 'book-uuid-2'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'You must offer at least 1 book' })
  @IsUUID('4', { each: true })
  offered_book_ids: string[];

  @ApiProperty({
    description: 'Books you want from receiver',
    type: [String],
    example: ['book-uuid-3'],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'You must request at least 1 book' })
  @IsUUID('4', { each: true })
  requested_book_ids: string[];

  @ApiPropertyOptional({
    description: 'Optional message to receiver',
    example: 'Hi! I would love to exchange these books with you.',
  })
  @IsString()
  @IsOptional()
  message?: string;
}

// ==================== RESPOND TO REQUEST ====================
export class RespondToRequestDto {
  @ApiProperty({
    description: 'Accept or reject the request',
    enum: ['accept', 'reject'],
    example: 'accept',
  })
  @IsEnum(['accept', 'reject'])
  action: 'accept' | 'reject';

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if rejecting)',
    example: 'Sorry, I already exchanged this book with someone else.',
  })
  @IsString()
  @IsOptional()
  rejection_reason?: string;
}

// ==================== CONFIRM EXCHANGE COMPLETION ====================
export class ConfirmExchangeDto {
  @ApiProperty({
    description: 'Confirm that you received the books',
    example: true,
  })
  confirm: boolean;
}

// ==================== QUERY EXCHANGE REQUESTS ====================
export class QueryExchangeRequestsDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ExchangeRequestStatus,
    example: 'PENDING',
  })
  @IsEnum(ExchangeRequestStatus)
  @IsOptional()
  status?: ExchangeRequestStatus;

  @ApiPropertyOptional({
    description: 'Filter by type',
    enum: ['sent', 'received'],
    example: 'received',
  })
  @IsEnum(['sent', 'received'])
  @IsOptional()
  type?: 'sent' | 'received';

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

// ==================== QUERY EXCHANGES ====================
export class QueryExchangesDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['PENDING', 'ACCEPTED', 'COMPLETED', 'CANCELLED'],
    example: 'PENDING',
  })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiPropertyOptional({ example: 1, default: 1 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, default: 20 })
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  @IsOptional()
  limit?: number = 20;
}

// ==================== RESPONSE DTOs ====================
export class ExchangeRequestResponseDto {
  @ApiProperty()
  request_id: string;

  @ApiProperty()
  requester: {
    member_id: string;
    full_name: string;
    avatar_url: string;
    region: string;
    trust_score: number;
  };

  @ApiProperty()
  receiver: {
    member_id: string;
    full_name: string;
    avatar_url: string;
    region: string;
    trust_score: number;
  };

  @ApiProperty({ enum: ExchangeRequestStatus })
  status: ExchangeRequestStatus;

  @ApiProperty()
  offered_books: Array<{
    book_id: string;
    title: string;
    author: string;
    condition: string;
  }>;

  @ApiProperty()
  requested_books: Array<{
    book_id: string;
    title: string;
    author: string;
    condition: string;
  }>;

  @ApiPropertyOptional()
  message?: string;

  @ApiPropertyOptional()
  rejection_reason?: string;

  @ApiProperty()
  created_at: Date;

  @ApiPropertyOptional()
  responded_at?: Date;
}

export class ExchangeResponseDto {
  @ApiProperty()
  exchange_id: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  member_a: {
    member_id: string;
    full_name: string;
    avatar_url: string;
  };

  @ApiProperty()
  member_b: {
    member_id: string;
    full_name: string;
    avatar_url: string;
  };

  @ApiProperty()
  books: Array<{
    book_id: string;
    title: string;
    from: string;
    to: string;
  }>;

  @ApiProperty()
  member_a_confirmed: boolean;

  @ApiProperty()
  member_b_confirmed: boolean;

  @ApiPropertyOptional()
  completed_at?: Date;

  @ApiProperty()
  created_at: Date;
}

export class ExchangeStatsResponseDto {
  @ApiProperty()
  total_requests_sent: number;

  @ApiProperty()
  total_requests_received: number;

  @ApiProperty()
  pending_requests: number;

  @ApiProperty()
  active_exchanges: number;

  @ApiProperty()
  completed_exchanges: number;

  @ApiProperty()
  success_rate: number;
}

// ==================== PAGINATED RESPONSES ====================
export class PaginatedExchangeRequestsDto {
  @ApiProperty({ type: [ExchangeRequestResponseDto] })
  items: ExchangeRequestResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}

export class PaginatedExchangesDto {
  @ApiProperty({ type: [ExchangeResponseDto] })
  items: ExchangeResponseDto[];

  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  pages: number;
}