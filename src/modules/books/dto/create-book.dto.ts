import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, IsInt, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import { BookCondition } from '../../../infrastructure/database/entities/book.entity';

export class CreateBookDto {
  @ApiPropertyOptional({
    description: 'Google Books ID (auto-fill from search)',
    example: 'zyTCAlFPjgYC',
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => {
    const v = (value ?? '').toString().trim();
    return v && v.toLowerCase() !== 'string' ? v : undefined; // tránh placeholder "string"
  })
  google_books_id?: string;

  @ApiProperty({ example: 'Clean Code', description: 'Book title' })
  @IsNotEmpty()
  @IsString()
  @MaxLength(255)
  title: string;

  @ApiPropertyOptional({ example: 'Robert C. Martin' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional({ example: '9780132350884' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional({ example: 'Prentice Hall' })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @ApiPropertyOptional({ example: '2008-08-01', description: 'Publish date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  publish_date?: string;

  @ApiPropertyOptional({ example: 'A handbook of agile software craftsmanship' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ example: 'Programming' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional({ example: 'en', description: 'Language code (default: vi)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @ApiPropertyOptional({ example: 464 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page_count?: number;

  @ApiPropertyOptional({ example: 'https://example.com/cover.jpg' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image_url?: string;

  @ApiPropertyOptional({
    enum: BookCondition,
    example: BookCondition.GOOD,
    description: 'Book physical condition',
  })
  @IsOptional()
  @IsEnum(BookCondition)
  book_condition?: BookCondition;
}

export class UpdateBookDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  author?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(20)
  isbn?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(255)
  publisher?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsDateString()
  publish_date?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(100)
  category?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(50)
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page_count?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(500)
  cover_image_url?: string;

  @ApiPropertyOptional({ enum: BookCondition })
  @IsOptional()
  @IsEnum(BookCondition)
  book_condition?: BookCondition;
}

export class SearchGoogleBooksDto {
  @ApiProperty({ example: 'Clean Code', description: 'Search query (title, author, ISBN)' })
  @IsNotEmpty()
  @IsString()
  query: string;

  @ApiPropertyOptional({ example: 20, description: 'Max results (default: 20)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  maxResults?: number;
}
