// src/modules/books/dto/books.dto.ts
import { IsString, IsOptional, IsInt, Min, Max, IsEnum, IsNotEmpty } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

// ==================== EXISTING DTOs ====================
export class CreateBookDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ example: '9780132350884' })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: 'bCmVDwAAQBAJ' })
  @IsString()
  @IsOptional()
  google_books_id?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ example: 'Like New' })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ example: 'Great book for developers' })
  @IsString()
  @IsOptional()
  description?: string;
}

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;
}

// ==================== NEW SEARCH DTOs ====================

export class SearchBooksDto {
  @ApiProperty({ 
    description: 'Search query (title, author, or ISBN)',
    example: 'Clean Code'
  })
  @IsString()
  @IsNotEmpty()
  q: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsString()
  @IsOptional()
  category?: string;

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

export class AdvancedSearchDto {
  @ApiPropertyOptional({ description: 'Book title (partial match)' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: 'Author name (partial match)' })
  @IsString()
  @IsOptional()
  author?: string;

  @ApiPropertyOptional({ description: 'ISBN (exact match)' })
  @IsString()
  @IsOptional()
  isbn?: string;

  @ApiPropertyOptional({ example: 'Technology' })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiPropertyOptional({ 
    description: 'Owner region',
    example: 'Ho Chi Minh City'
  })
  @IsString()
  @IsOptional()
  region?: string;

  @ApiPropertyOptional({ 
    description: 'Book condition',
    example: 'Like New'
  })
  @IsString()
  @IsOptional()
  condition?: string;

  @ApiPropertyOptional({ 
    enum: ['created_at', 'title', 'author'],
    default: 'created_at'
  })
  @IsEnum(['created_at', 'title', 'author'])
  @IsOptional()
  sort_by?: 'created_at' | 'title' | 'author' = 'created_at';

  @ApiPropertyOptional({ 
    enum: ['ASC', 'DESC'],
    default: 'DESC'
  })
  @IsEnum(['ASC', 'DESC'])
  @IsOptional()
  order?: 'ASC' | 'DESC' = 'DESC';

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