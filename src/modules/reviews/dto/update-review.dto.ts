import { IsOptional, IsInt, Min, Max, IsString, MaxLength } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReviewDto {
  @ApiPropertyOptional({ description: 'Updated rating 1-5', minimum: 1, maximum: 5, example: 4 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(5)
  rating?: number;

  @ApiPropertyOptional({ description: 'Updated comment', maxLength: 2000, example: 'Thanks, updated comment.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
