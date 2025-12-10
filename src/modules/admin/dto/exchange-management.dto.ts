// ============================================================
// src/modules/admin/dto/exchange-management.dto.ts
// DTOs cho Exchange Management
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsIn, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

// DTO query exchanges
export class QueryExchangesDto {
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

  @ApiPropertyOptional({ example: 'PENDING', description: 'Lọc theo trạng thái (PENDING, ACCEPTED, MEETING_SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED)' })
  @IsOptional()
  @IsIn(['PENDING', 'ACCEPTED', 'MEETING_SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED'])
  status?: string;

  @ApiPropertyOptional({ example: 'member-uuid-001', description: 'Lọc theo member_a_id' })
  @IsOptional()
  @IsString()
  memberAId?: string;

  @ApiPropertyOptional({ example: 'member-uuid-002', description: 'Lọc theo member_b_id' })
  @IsOptional()
  @IsString()
  memberBId?: string;

  @ApiPropertyOptional({ example: '2025-11-01', description: 'Lọc từ ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ example: '2025-11-30', description: 'Lọc đến ngày (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  endDate?: string;

  @ApiPropertyOptional({ example: 'created_at', description: 'Sắp xếp theo trường' })
  @IsOptional()
  @IsIn(['created_at', 'completed_at', 'status'])
  sortBy?: string = 'created_at';

  @ApiPropertyOptional({ example: 'DESC', description: 'Thứ tự sắp xếp' })
  @IsOptional()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';
}

// DTO cancel exchange
export class CancelExchangeDto {
  @ApiProperty({ example: 'Exchange bị report vi phạm, hủy theo quyết định admin', description: 'Lý do hủy exchange' })
  @IsString()
  reason: string;
}
