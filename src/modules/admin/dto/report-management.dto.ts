// ============================================================
// src/modules/admin/dto/report-management.dto.ts
// DTOs cho Report System
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max, IsUUID, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus, ReportPriority } from '../../../infrastructure/database/entities/violation-report.entity';

// DTO query reports
export class QueryReportsDto {
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

  @ApiPropertyOptional({ example: 'PENDING', enum: ReportStatus, description: 'Lọc theo trạng thái' })
  @IsOptional()
  @IsEnum(ReportStatus)
  status?: ReportStatus;

  @ApiPropertyOptional({ example: 'HIGH', enum: ReportPriority, description: 'Lọc theo độ ưu tiên' })
  @IsOptional()
  @IsEnum(ReportPriority)
  priority?: ReportPriority;

  @ApiPropertyOptional({ example: 'SPAM', description: 'Lọc theo loại vi phạm (VARCHAR)' })
  @IsOptional()
  @IsString()
  type?: string; // Changed from enum to string

  @ApiPropertyOptional({ example: 'test-member-alice', description: 'Lọc theo người báo cáo' })
  @IsOptional()
  @IsString()
  reportedBy?: string;
}

// DTO resolve report
export class ResolveReportDto {
  @ApiProperty({ example: 'Đã xử lý và xóa nội dung vi phạm.', description: 'Kết luận và hành động đã thực hiện' })
  @IsString()
  resolution: string;

  @ApiProperty({ 
    example: 'WARNING', 
    description: 'Hình thức xử phạt: WARNING (cảnh cáo), CONTENT_REMOVAL (xóa nội dung), TEMP_BAN (khóa 7 ngày), PERMANENT_BAN (khóa vĩnh viễn)',
    enum: ['WARNING', 'CONTENT_REMOVAL', 'TEMP_BAN', 'PERMANENT_BAN', 'NONE']
  })
  @IsOptional()
  @IsString()
  penalty?: 'WARNING' | 'CONTENT_REMOVAL' | 'TEMP_BAN' | 'PERMANENT_BAN' | 'NONE';

  @ApiPropertyOptional({ example: 5, description: 'Số điểm Trust Score bị trừ (0-20)' })
  @IsOptional()
  @IsNumber()
  trust_score_penalty?: number;
}

// DTO dismiss report
export class DismissReportDto {
  @ApiProperty({ example: 'Nội dung không vi phạm quy định', description: 'Lý do từ chối' })
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

  @ApiProperty({ example: 'book-uuid-123', description: 'ID của đối tượng bị báo cáo' })
  @IsUUID()
  reported_item_id: string; // Changed from target_id

  @ApiProperty({ example: 'test-member-bob', description: 'Member ID của người bị report' })
  @IsUUID()
  reported_member_id: string; // Added to match DB schema

  @ApiProperty({ example: 'Sách này có nội dung spam và quảng cáo', description: 'Mô tả chi tiết' })
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
