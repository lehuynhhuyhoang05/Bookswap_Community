// ============================================================
// src/modules/admin/dto/suspicious-activity.dto.ts
// DTOs for Spam/Fraud Detection
// ============================================================
import { IsOptional, IsNumber, Min, Max, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export enum SuspiciousActivityType {
  HIGH_BOOK_CREATION = 'HIGH_BOOK_CREATION',
  HIGH_MESSAGE_VOLUME = 'HIGH_MESSAGE_VOLUME',
  HIGH_EXCHANGE_REQUESTS = 'HIGH_EXCHANGE_REQUESTS',
  NEW_ACCOUNT_HIGH_ACTIVITY = 'NEW_ACCOUNT_HIGH_ACTIVITY',
  TRUST_SCORE_DROP = 'TRUST_SCORE_DROP',
  MULTIPLE_REPORTS = 'MULTIPLE_REPORTS',
}

export class QuerySuspiciousActivitiesDto {
  @ApiPropertyOptional({ 
    description: 'Loại hoạt động đáng ngờ',
    enum: SuspiciousActivityType
  })
  @IsOptional()
  @IsEnum(SuspiciousActivityType)
  type?: SuspiciousActivityType;

  @ApiPropertyOptional({ 
    description: 'Số giờ gần đây để kiểm tra',
    default: 24,
    minimum: 1,
    maximum: 168
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(168)
  hours?: number = 24;

  @ApiPropertyOptional({ description: 'Trang hiện tại', default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ description: 'Số lượng mỗi trang', default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}
