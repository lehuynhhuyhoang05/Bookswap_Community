import {
  IsString,
  IsArray,
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  Max,
  ArrayMinSize,
  IsNotEmpty,
  MaxLength,
  Matches,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { ExchangeRequestStatus } from '../../../infrastructure/database/entities/exchange-request.entity';

// ==================== CREATE EXCHANGE REQUEST ====================
export class CreateExchangeRequestDto {
  @ApiProperty({
    description: 'ID of the member you want to exchange with (member_id)',
    example: 'test-member-bob',
  })
  @IsString({ message: 'receiver_id must be a string' })
  @IsNotEmpty({ message: 'receiver_id is required' })
  @MaxLength(36, { message: 'receiver_id must not exceed 36 characters' })
  receiver_id: string;

  @ApiProperty({
    description: 'Books you are offering (from your library)',
    type: [String],
    example: ['test-book-alice-1', 'seed-book-nam-clrs'],
  })
  @IsArray({ message: 'offered_book_ids must be an array' })
  @ArrayMinSize(1, { message: 'You must offer at least 1 book' })
  @IsString({ each: true, message: 'Each book ID must be a string' })
  @MaxLength(36, { each: true, message: 'Each book ID must not exceed 36 characters' })
  offered_book_ids: string[];

  @ApiProperty({
    description: 'Books you want from receiver',
    type: [String],
    example: ['test-book-bob-1'],
  })
  @IsArray({ message: 'requested_book_ids must be an array' })
  @ArrayMinSize(1, { message: 'You must request at least 1 book' })
  @IsString({ each: true, message: 'Each book ID must be a string' })
  @MaxLength(36, { each: true, message: 'Each book ID must not exceed 36 characters' })
  requested_book_ids: string[];

  @ApiPropertyOptional({
    description: 'Optional message to receiver (max 500 characters)',
    example: 'Hi! I would love to exchange these books with you.',
    maxLength: 500,
  })
  @IsString({ message: 'message must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'message must not exceed 500 characters' })
  message?: string;

  @ApiPropertyOptional({
    description: 'Priority level of exchange request',
    enum: ['URGENT', 'HIGH', 'NORMAL', 'LOW'],
    example: 'NORMAL',
  })
  @IsEnum(['URGENT', 'HIGH', 'NORMAL', 'LOW'], {
    message: 'priority must be one of: URGENT, HIGH, NORMAL, LOW',
  })
  @IsOptional()
  priority?: 'URGENT' | 'HIGH' | 'NORMAL' | 'LOW' = 'NORMAL';
}

// ==================== RESPOND TO REQUEST ====================
export class RespondToRequestDto {
  @ApiProperty({
    description: 'Accept or reject the request',
    enum: ['accept', 'reject'],
    example: 'accept',
  })
  @IsEnum(['accept', 'reject'], {
    message: 'action must be either "accept" or "reject"',
  })
  action: 'accept' | 'reject';

  @ApiPropertyOptional({
    description: 'Reason for rejection (required if rejecting, max 500 characters)',
    example: 'Sorry, I already exchanged this book with someone else.',
    maxLength: 500,
  })
  @IsString({ message: 'rejection_reason must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'rejection_reason must not exceed 500 characters' })
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

// ==================== UPDATE MEETING INFO ====================
export class UpdateMeetingInfoDto {
  @ApiPropertyOptional({
    description: 'Meeting location',
    example: 'Central Library, District 1',
    maxLength: 255,
  })
  @IsString({ message: 'meeting_location must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'meeting_location must not exceed 255 characters' })
  meeting_location?: string;

  @ApiPropertyOptional({
    description: 'Meeting time (ISO 8601 format)',
    example: '2024-12-25T14:00:00Z',
  })
  @IsOptional()
  @IsString()
  meeting_time?: string;

  @ApiPropertyOptional({
    description: 'Meeting notes',
    example: 'Please bring both books in good condition',
    maxLength: 500,
  })
  @IsString({ message: 'meeting_notes must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'meeting_notes must not exceed 500 characters' })
  meeting_notes?: string;
}

// ==================== CANCEL EXCHANGE ====================
export class CancelExchangeDto {
  @ApiProperty({
    description: 'Reason for cancellation',
    enum: ['USER_CANCELLED', 'NO_SHOW', 'BOTH_NO_SHOW', 'DISPUTE', 'ADMIN_CANCELLED'],
    example: 'USER_CANCELLED',
  })
  @IsEnum(['USER_CANCELLED', 'NO_SHOW', 'BOTH_NO_SHOW', 'DISPUTE', 'ADMIN_CANCELLED'], {
    message: 'cancellation_reason must be a valid enum value',
  })
  cancellation_reason: 'USER_CANCELLED' | 'NO_SHOW' | 'BOTH_NO_SHOW' | 'DISPUTE' | 'ADMIN_CANCELLED';

  @ApiPropertyOptional({
    description: 'Additional details about cancellation',
    example: 'I am no longer interested in this exchange',
    maxLength: 500,
  })
  @IsString({ message: 'cancellation_details must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'cancellation_details must not exceed 500 characters' })
  cancellation_details?: string;
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

// ==================== EXCHANGE SUGGESTIONS ====================
export class BookDetailDto {
  @ApiProperty({ example: 'book-uuid-1' })
  book_id: string;

  @ApiProperty({ example: 'Clean Code' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author: string;

  @ApiProperty({ example: 'Programming' })
  category: string;

  @ApiProperty({ example: 'Like New' })
  condition: string;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  cover_image?: string;
}

export class WantDetailDto {
  @ApiProperty({ example: 'want-uuid-1' })
  wanted_id: string;

  @ApiProperty({ example: 'Clean Code' })
  title: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin' })
  author?: string;

  @ApiPropertyOptional({ example: 'Programming' })
  category?: string;

  @ApiProperty({ example: 8, description: 'Priority level 1-10' })
  priority: number;
}

export class BookMatchDto {
  @ApiProperty({ type: BookDetailDto })
  my_book: BookDetailDto;

  @ApiProperty({ type: WantDetailDto })
  their_want: WantDetailDto;

  @ApiProperty({ example: 0.856, description: 'Match score between 0 and 1' })
  match_score: number;

  @ApiProperty({
    example: ['Exact title match', 'Same author', 'High priority want'],
    description: 'Reasons why this is a good match',
  })
  reasons: string[];
}

export class ReverseBookMatchDto {
  @ApiProperty({ type: BookDetailDto })
  their_book: BookDetailDto;

  @ApiProperty({ type: WantDetailDto })
  my_want: WantDetailDto;

  @ApiProperty({ example: 0.923, description: 'Match score between 0 and 1' })
  match_score: number;

  @ApiProperty({
    example: ['Exact title match', 'Category: Programming', 'Excellent condition'],
    description: 'Reasons why this is a good match',
  })
  reasons: string[];
}

export class MatchingBooksDto {
  @ApiProperty({
    type: [BookMatchDto],
    description: 'Books they want from you',
  })
  they_want_from_me: BookMatchDto[];

  @ApiProperty({
    type: [ReverseBookMatchDto],
    description: 'Books you want from them',
  })
  i_want_from_them: ReverseBookMatchDto[];
}

export class ScoreBreakdownDto {
  @ApiProperty({ example: 0.285, description: 'Score from book matching (title, author, category)' })
  book_match: number;

  @ApiProperty({ example: 0.15, description: 'Score from member trust level' })
  trust_score: number;

  @ApiProperty({ example: 0.08, description: 'Score from exchange history' })
  exchange_history: number;

  @ApiProperty({ example: 0.06, description: 'Score from member ratings' })
  rating: number;

  @ApiProperty({ example: 0.1, description: 'Score from geographic proximity' })
  geographic: number;

  @ApiProperty({ example: 0.05, description: 'Score from member verification status' })
  verification: number;

  @ApiProperty({ example: 0.08, description: 'Score from want priority level' })
  priority: number;

  @ApiProperty({ example: 0.05, description: 'Score from book condition' })
  condition: number;
}

export class SuggestionMemberDto {
  @ApiProperty({ example: 'member-uuid-1' })
  member_id: string;

  @ApiProperty({ example: 'John Doe' })
  full_name: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.jpg' })
  avatar_url?: string;

  @ApiProperty({ example: 'Hanoi' })
  region: string;

  @ApiProperty({ example: 4.5, description: 'Trust score from 0 to 5' })
  trust_score: number;

  @ApiProperty({ example: 4.8, description: 'Average rating from 0 to 5' })
  average_rating: number;

  @ApiProperty({ example: true })
  is_verified: boolean;

  @ApiProperty({ example: 15 })
  completed_exchanges: number;
}

export class ExchangeSuggestionDto {
  @ApiProperty({ example: 'suggestion-uuid-1' })
  suggestion_id: string;

  @ApiProperty({ example: 0.753, description: 'Overall match score between 0 and 1' })
  match_score: number;

  @ApiProperty({ example: 4, description: 'Total number of matching books' })
  total_matching_books: number;

  @ApiProperty({ example: false })
  is_viewed: boolean;

  @ApiProperty({ type: ScoreBreakdownDto })
  score_breakdown: ScoreBreakdownDto;

  @ApiProperty()
  created_at: Date | null;

  @ApiProperty()
  expired_at: Date | null;

  @ApiPropertyOptional()
  viewed_at?: Date | null;

  @ApiProperty({ type: SuggestionMemberDto })
  member: SuggestionMemberDto;

  @ApiProperty({ type: MatchingBooksDto })
  matching_books: MatchingBooksDto;
}

export class ExchangeSuggestionsResponseDto {
  @ApiProperty({
    type: [ExchangeSuggestionDto],
    description: 'List of exchange suggestions ordered by match score',
  })
  suggestions: ExchangeSuggestionDto[];

  @ApiProperty({ example: 5 })
  total: number;
}