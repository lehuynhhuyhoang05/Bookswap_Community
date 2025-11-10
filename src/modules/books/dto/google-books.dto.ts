import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class SearchGoogleBooksQueryDto {
  @ApiProperty({ example: 'Clean Code' })
  @IsString()
  @IsNotEmpty()
  query: string;

  @ApiPropertyOptional({ example: 20, description: '1–40 (giới hạn Google)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  maxResults?: number = 20;
}

export class GoogleBookIdParamDto {
  @ApiProperty({ example: 'zyTCAlFPjgYC' })
  @IsString()
  @IsNotEmpty()
  googleBookId: string;
}

export class GoogleIsbnParamDto {
  @ApiProperty({ example: '9780132350884' })
  @IsString()
  @IsNotEmpty()
  isbn: string;
}
