// ============================================================
// src/modules/admin/dto/user-activity.dto.ts
// DTOs cho User Activity Tracking
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsDateString, IsIn } from 'class-validator';
import { Type } from 'class-transformer';

// DTO query user activities
export class QueryUserActivitiesDto {
  @ApiPropertyOptional({ 
    example: 1, 
    description: 'Số trang (mặc định: 1)',
    default: 1
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ 
    example: 50, 
    description: 'Số items mỗi trang (mặc định: 50)',
    default: 50
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 50;

  @ApiPropertyOptional({ 
    example: 'LOGIN', 
    description: '🔍 Lọc theo loại hành động (LOGIN, CREATE_BOOK, SEND_MESSAGE, CONFIRM_EXCHANGE...)',
    enum: [
      'LOGIN', 'LOGOUT', 'REGISTER',
      'CREATE_BOOK', 'UPDATE_BOOK', 'DELETE_BOOK',
      'CREATE_EXCHANGE_REQUEST', 'ACCEPT_EXCHANGE', 'REJECT_EXCHANGE', 
      'CANCEL_EXCHANGE', 'CONFIRM_EXCHANGE',
      'SEND_MESSAGE',
      'CREATE_REVIEW',
      'ADD_WANTED_BOOK', 'REMOVE_WANTED_BOOK',
      'REPORT_CONTENT', 'OTHER'
    ]
  })
  @IsOptional()
  @IsString()
  action?: string;

  @ApiPropertyOptional({ 
    example: '2025-11-01T00:00:00.000Z', 
    description: '📅 Từ ngày (ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ)' 
  })
  @IsOptional()
  @IsDateString()
  startDate?: string;

  @ApiPropertyOptional({ 
    example: '2025-11-05T23:59:59.999Z', 
    description: '📅 Đến ngày (ISO 8601: YYYY-MM-DDTHH:mm:ss.sssZ)' 
  })
  @IsOptional()
  @IsDateString()
  endDate?: string;
}

// DTO query user activity statistics
export class QueryUserActivityStatsDto {
  @ApiPropertyOptional({ 
    example: 30, 
    description: '📊 Thống kê trong N ngày gần đây (1-365 ngày, mặc định 30)',
    default: 30
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(365)
  days?: number = 30;
}
