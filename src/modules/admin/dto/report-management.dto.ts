// ============================================================
// src/modules/admin/dto/report-management.dto.ts
// DTOs cho Report System
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import {
  ReportPriority,
  ReportStatus,
} from '../../../infrastructure/database/entities/violation-report.entity';

// DTO query reports
export class QueryReportsDto {
  @ApiPropertyOptional({ example: 1, description: 'Trang hiện tại' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({
    example: 20,
    description: 'Số lượng report mỗi trang',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 20;

  @ApiPropertyOptional({
    example: 'PENDING',
    enum: ['PENDING', 'IN_REVIEW', 'RESOLVED', 'DISMISSED'],
    description: 'Lọc theo trạng thái report',
  })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({
    example: 'HIGH',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    description: 'Lọc theo độ ưu tiên',
  })
  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;

  @ApiPropertyOptional({
    example: 'SPAM',
    description: 'Lọc theo loại vi phạm',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    example: 'test-member-alice',
    description: 'Lọc theo người báo cáo',
  })
  @IsOptional()
  @IsString()
  reportedBy?: string;
}

// DTO resolve report
export class ResolveReportDto {
  @ApiProperty({
    example:
      'Đã xử lý và xóa nội dung vi phạm. Removed inappropriate book and warned user.',
    description: 'Hành động đã thực hiện',
  })
  @IsString()
  resolution: string;
}

// DTO dismiss report
export class DismissReportDto {
  @ApiProperty({
    example: 'Nội dung không vi phạm quy định',
    description: 'Lý do bác bỏ',
  })
  @IsString()
  reason: string;
}

// DTO create report (từ member)
export class CreateReportDto {
  @ApiProperty({ example: 'SPAM', description: 'Loại vi phạm (VARCHAR)' })
  @IsString()
  report_type: string; // Changed to string to match DB schema

  @ApiProperty({ example: 'BOOK', description: 'Loại đối tượng bị báo cáo' })
  @IsString()
  reported_item_type: string; // Changed from target_type

  @ApiProperty({
    example: 'book-uuid-123',
    description: 'ID của đối tượng bị báo cáo',
  })
  @IsUUID()
  reported_item_id: string; // Changed from target_id

  @ApiProperty({
    example: 'test-member-bob',
    description: 'Member ID của người bị report',
  })
  @IsUUID()
  reported_member_id: string; // Added to match DB schema

  @ApiProperty({
    example: 'Sách này có nội dung spam và quảng cáo',
    description: 'Mô tả chi tiết',
  })
  @IsString()
  description: string;
}

// Response DTO
export class ReportDetailResponseDto {
  report_id: string;
  reporter: {
    member_id: string;
    email: string;
    full_name: string;
  };
  report_type: string; // Changed from ReportType enum to string
  reported_item_type: string; // Changed from target_type
  reported_item_id: string; // Changed from target_id
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  resolution?: string;
  created_at: Date;
  resolved_at?: Date;
  resolved_by?: string; // Changed from action_taken
}
