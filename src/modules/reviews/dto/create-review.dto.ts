import { IsString, IsUUID, IsInt, Min, Max, IsOptional, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReviewDto {
  @ApiProperty({ description: 'Exchange ID (must be a completed exchange)', example: '2017eacd-a88b-4406-af60-b278b6ab0bd0' })
  @IsUUID()
  exchange_id: string;

  @ApiPropertyOptional({ description: 'Reviewer ID (populated from authenticated user; do not send)', example: '88a84968-25da-4a89-bfc8-71d2cb0abfb1', readOnly: true })
  @IsUUID()
  @IsOptional()
  reviewer_id?: string;

  @ApiProperty({ description: 'Member being reviewed (reviewee). Can be member UUID, or email/full name to resolve to a member.', example: 'test-member-bob or 88a84968-25da-4a89-bfc8-71d2cb0abfb1' })
  @IsString()
  reviewee_id: string;

  @ApiProperty({ description: 'Rating 1-5', minimum: 1, maximum: 5, example: 5 })
  @IsInt()
  @Min(1)
  @Max(5)
  rating: number;

  @ApiPropertyOptional({ description: 'Optional textual comment', maxLength: 2000, example: 'Great trade, on time and as described.' })
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  comment?: string;
}
