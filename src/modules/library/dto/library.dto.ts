// src/modules/library/dto/library.dto.ts
/**
 * DTOs for Personal Library endpoints
 * Includes comprehensive input validation
 */
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  IsNotEmpty,
  Min,
  Max,
  MaxLength,
  IsISBN,
  IsEnum,
  IsArray,
  ArrayMinSize,
  IsUrl,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PreferredCondition } from '../../../infrastructure/database/entities/book-wanted.entity';

// ==================== CREATE WANTED BOOK ====================
export class CreateWantedBookDto {
  @ApiProperty({
    example: 'Clean Code',
    description: 'Book title (required)',
    maxLength: 255,
  })
  @IsString({ message: 'title must be a string' })
  @IsNotEmpty({ message: 'title is required' })
  @MaxLength(255, { message: 'title must not exceed 255 characters' })
  title: string;

  @ApiPropertyOptional({
    example: 'Robert C. Martin',
    description: 'Author name',
    maxLength: 255,
  })
  @IsString({ message: 'author must be a string' })
  @IsOptional()
  @MaxLength(255, { message: 'author must not exceed 255 characters' })
  author?: string;

  @ApiPropertyOptional({
    example: '9780132350884',
    description: 'ISBN-10 or ISBN-13 (validated if provided)',
  })
  @IsOptional()
  @IsISBN(undefined, { message: 'isbn must be a valid ISBN-10 or ISBN-13' })
  isbn?: string;

  @ApiPropertyOptional({
    example: 'bCmVDwAAQBAJ',
    description: 'Google Books ID',
    maxLength: 100,
  })
  @IsString({ message: 'google_books_id must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'google_books_id must not exceed 100 characters' })
  google_books_id?: string;

  @ApiPropertyOptional({
    example: 'Programming',
    description: 'Book category',
    maxLength: 100,
  })
  @IsString({ message: 'category must be a string' })
  @IsOptional()
  @MaxLength(100, { message: 'category must not exceed 100 characters' })
  category?: string;

  @ApiPropertyOptional({
    example: 'https://books.google.com/books/content?id=xxx',
    description: 'Cover image URL from Google Books',
    maxLength: 500,
  })
  @IsString({ message: 'cover_image_url must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'cover_image_url must not exceed 500 characters' })
  cover_image_url?: string;

  @ApiPropertyOptional({
    example: 'GOOD_UP',
    description: 'Minimum acceptable book condition',
    enum: PreferredCondition,
  })
  @IsOptional()
  @IsEnum(PreferredCondition, { message: 'preferred_condition must be a valid PreferredCondition enum' })
  preferred_condition?: PreferredCondition = PreferredCondition.ANY;

  @ApiPropertyOptional({
    example: 'vi',
    description: 'Preferred language',
    maxLength: 50,
  })
  @IsString({ message: 'language must be a string' })
  @IsOptional()
  @MaxLength(50, { message: 'language must not exceed 50 characters' })
  language?: string;

  @ApiPropertyOptional({
    example: 8,
    description: 'Priority level (1-10, higher is more important)',
    minimum: 1,
    maximum: 10,
  })
  @IsInt({ message: 'priority must be an integer' })
  @IsOptional()
  @Min(1, { message: 'priority must be at least 1' })
  @Max(10, { message: 'priority must not exceed 10' })
  @Type(() => Number)
  priority?: number = 5;

  @ApiPropertyOptional({
    example: 'Looking for hardcover edition in excellent condition',
    description: 'Additional notes about this wanted book',
    maxLength: 500,
  })
  @IsString({ message: 'notes must be a string' })
  @IsOptional()
  @MaxLength(500, { message: 'notes must not exceed 500 characters' })
  notes?: string;
}

// ==================== UPDATE WANTED BOOK ====================
export class UpdateWantedBookDto extends PartialType(CreateWantedBookDto) {}

// ==================== QUERY WANTED BOOKS ====================
export class QueryWantedBooksDto {
  @ApiPropertyOptional({
    example: 1,
    description: 'Page number',
    default: 1,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Type(() => Number)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Items per page',
    default: 20,
  })
  @IsInt()
  @IsOptional()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'Clean Code',
    description: 'Search by title or author',
  })
  @IsString()
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Filter by category',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({
    example: 'priority',
    description: 'Sort field (priority, added_at, title)',
    enum: ['priority', 'added_at', 'title'],
  })
  @IsString()
  @IsOptional()
  sort_by?: 'priority' | 'added_at' | 'title' = 'priority';

  @ApiPropertyOptional({
    example: 'DESC',
    description: 'Sort order',
    enum: ['ASC', 'DESC'],
  })
  @IsString()
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';
}

// ==================== RESPONSE DTOs ====================
export class WantedBookResponseDto {
  @ApiProperty({ example: 'uuid' })
  wanted_id: string;

  @ApiProperty({ example: 'Clean Code' })
  title: string;

  @ApiProperty({ example: 'Robert C. Martin' })
  author: string;

  @ApiProperty({ example: '9780132350884' })
  isbn: string;

  @ApiProperty({ example: 'Technology' })
  category: string;

  @ApiProperty({ example: 7 })
  priority: number;

  @ApiProperty({ example: 'Looking for latest edition' })
  notes: string;

  @ApiProperty({ example: '2025-10-30T10:30:00Z' })
  added_at: Date;
}

export class LibraryStatsResponseDto {
  @ApiProperty({ example: 'uuid' })
  library_id: string;

  @ApiProperty({ example: 25 })
  total_owned_books: number;

  @ApiProperty({ example: 10 })
  total_wanted_books: number;

  @ApiProperty({ example: '2025-10-30T15:00:00Z' })
  last_updated: Date;

  @ApiProperty({ type: [WantedBookResponseDto] })
  wanted_books?: WantedBookResponseDto[];
}

export class PaginatedWantedBooksDto {
  @ApiProperty({ type: [WantedBookResponseDto] })
  data: WantedBookResponseDto[];

  @ApiProperty({
    example: {
      total: 50,
      page: 1,
      limit: 20,
      totalPages: 3,
    },
  })
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}