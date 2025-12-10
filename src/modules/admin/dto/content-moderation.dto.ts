// ============================================================
// src/modules/admin/dto/content-moderation.dto.ts
// DTOs cho Content Moderation
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsIn, IsBoolean } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// DTO query books
export class QueryBooksDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: 'AVAILABLE', description: 'Lọc theo trạng thái sách' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: true, description: 'Chỉ hiện sách bị báo cáo' })
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  reported?: boolean;

  @ApiPropertyOptional({ example: 'Clean Code', description: 'Tìm kiếm theo tên sách' })
  @IsOptional()
  @IsString()
  search?: string;
}

// DTO remove book
export class RemoveBookDto {
  @ApiProperty({ example: 'Nội dung không phù hợp', description: 'Lý do xóa sách' })
  @IsString()
  reason: string;
}

// DTO restore book
export class RestoreBookDto {
  @ApiProperty({ example: 'User appealed, restore after review', description: 'Lý do khôi phục sách' })
  @IsString()
  reason: string;
}

// DTO batch remove books
export class BatchRemoveBooksDto {
  @ApiProperty({ 
    example: ['book-id-1', 'book-id-2'], 
    description: 'Danh sách book IDs cần xóa (tối đa 50)' 
  })
  @IsString({ each: true })
  bookIds: string[];

  @ApiProperty({ example: 'Spam content from same user', description: 'Lý do xóa hàng loạt' })
  @IsString()
  reason: string;
}

// DTO query reviews
export class QueryReviewsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({ example: true, description: 'Chỉ hiện review bị báo cáo' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  reported?: boolean;

  @ApiPropertyOptional({ example: 1, description: 'Lọc theo rating', minimum: 1, maximum: 5 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;
}

// DTO remove review
export class RemoveReviewDto {
  @ApiProperty({ example: 'Review spam hoặc xúc phạm', description: 'Lý do xóa review' })
  @IsString()
  reason: string;
}
