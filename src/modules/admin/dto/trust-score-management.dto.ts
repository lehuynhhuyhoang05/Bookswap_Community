// ============================================================
// src/modules/admin/dto/trust-score-management.dto.ts
// DTOs for Trust Score Management
// ============================================================
import { IsNotEmpty, IsNumber, IsString, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AdjustTrustScoreDto {
  @ApiProperty({
    description: 'Số điểm thay đổi (có thể âm hoặc dương)',
    example: -5.0,
    minimum: -50,
    maximum: 50,
  })
  @IsNotEmpty({ message: 'Adjustment is required' })
  @IsNumber()
  @Min(-50, { message: 'Adjustment cannot be less than -50' })
  @Max(50, { message: 'Adjustment cannot be more than +50' })
  adjustment: number;

  @ApiProperty({
    description: 'Lý do thay đổi trust score',
    example: 'Scammer detected - fake exchanges',
  })
  @IsNotEmpty({ message: 'Reason is required' })
  @IsString()
  reason: string;
}
