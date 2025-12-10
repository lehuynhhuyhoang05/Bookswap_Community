import { IsString, IsOptional, IsEnum, IsNotEmpty, MaxLength, IsInt, IsDateString, IsArray, ArrayMinSize } from 'class-validator';
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

  @ApiProperty({
    description: 'URLs of photos taken by user to verify book ownership (at least 1 required)',
    example: ['https://example.com/my-book-photo1.jpg', 'https://example.com/my-book-photo2.jpg'],
    type: [String],
  })
  @IsArray({ message: 'user_photos phải là mảng các URL ảnh' })
  @ArrayMinSize(1, { message: 'Vui lòng upload ít nhất 1 ảnh sách thật của bạn để xác minh' })
  @IsString({ each: true, message: 'Mỗi URL ảnh phải là chuỗi' })
  user_photos: string[];

  @ApiProperty({
    enum: BookCondition,
    example: BookCondition.GOOD,
    description: 'Book physical condition (LIKE_NEW, VERY_GOOD, GOOD, FAIR, POOR)',
  })
  @IsNotEmpty({ message: 'Vui lòng chọn tình trạng sách' })
  @IsEnum(BookCondition, { message: 'Tình trạng sách không hợp lệ' })
  book_condition: BookCondition;

  @ApiPropertyOptional({ 
    example: 'Sách còn mới, chưa gấp trang',
    description: 'Notes about book condition' 
  })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  condition_notes?: string;
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

  @ApiPropertyOptional({
    description: 'URLs of photos taken by user',
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  user_photos?: string[];

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
