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