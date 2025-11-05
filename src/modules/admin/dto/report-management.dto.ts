// ============================================================
// src/modules/admin/dto/report-management.dto.ts
// DTOs cho Report System
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsOptional, IsInt, Min, Max, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ReportStatus, ReportPriority, ReportType } from '../../../infrastructure/database/entities/violation-report.entity';

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

  @ApiPropertyOptional({ example: 'SPAM', enum: ReportType, description: 'Lọc theo loại vi phạm' })
  @IsOptional()
  @IsEnum(ReportType)
  type?: ReportType;

  @ApiPropertyOptional({ example: 'test-member-alice', description: 'Lọc theo người báo cáo' })
  @IsOptional()
  @IsString()
  reportedBy?: string;
}

// DTO resolve report
export class ResolveReportDto {
  @ApiProperty({ example: 'Đã xử lý và xóa nội dung vi phạm', description: 'Cách giải quyết' })
  @IsString()
  resolution: string;

  @ApiProperty({ example: 'Removed inappropriate book and warned user', description: 'Hành động đã thực hiện' })
  @IsString()
  action_taken: string;
}

// DTO dismiss report
export class DismissReportDto {
  @ApiProperty({ example: 'Nội dung không vi phạm quy định', description: 'Lý do từ chối' })
  @IsString()
  reason: string;
}

// DTO create report (từ member)
export class CreateReportDto {
  @ApiProperty({ example: 'SPAM', enum: ReportType, description: 'Loại vi phạm' })
  @IsEnum(ReportType)
  report_type: ReportType;

  @ApiProperty({ example: 'BOOK', description: 'Loại đối tượng bị báo cáo' })
  @IsString()
  target_type: string;

  @ApiProperty({ example: 'book-uuid-123', description: 'ID của đối tượng bị báo cáo' })
  @IsUUID()
  target_id: string;

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
  report_type: ReportType;
  target_type: string;
  target_id: string;
  description: string;
  status: ReportStatus;
  priority: ReportPriority;
  resolution?: string;
  action_taken?: string;
  created_at: Date;
  resolved_at?: Date;
}
