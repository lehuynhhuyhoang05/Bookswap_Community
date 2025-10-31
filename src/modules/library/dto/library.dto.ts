// src/modules/library/dto/library.dto.ts
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import {
  IsString,
  IsOptional,
  IsInt,
  Min,
  Max,
  MaxLength,
  IsISBN,
} from 'class-validator';
import { Type } from 'class-transformer';

// ==================== CREATE WANTED BOOK ====================
export class CreateWantedBookDto {
  @ApiPropertyOptional({
    example: 'Clean Code',
    description: 'Book title',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional({
    example: 'Robert C. Martin',
    description: 'Author name',
  })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({
    example: '9780132350884',
    description: 'ISBN-10 or ISBN-13',
  })
  @IsOptional()
  @IsISBN()
  isbn?: string;

  @ApiPropertyOptional({
    example: 'bCmVDwAAQBAJ',
    description: 'Google Books ID',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  google_books_id?: string;

  @ApiPropertyOptional({
    example: 'Technology',
    description: 'Book category',
  })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({
    example: 5,
    description: 'Priority level (0-10), higher = more wanted',
    minimum: 0,
    maximum: 10,
  })
  @IsInt()
  @IsOptional()
  @Min(0)
  @Max(10)
  @Type(() => Number)
  priority?: number;

  @ApiPropertyOptional({
    example: 'Looking for the latest edition with code examples',
    description: 'Personal notes about the wanted book',
  })
  @IsString()
  @IsOptional()
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