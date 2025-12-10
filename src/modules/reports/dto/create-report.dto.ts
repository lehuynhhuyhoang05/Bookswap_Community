// ============================================================
// src/modules/reports/dto/create-report.dto.ts
// DTOs cho User Report Module
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEnum, IsUUID, IsOptional, MinLength, IsArray } from 'class-validator';

// Các loại report (khớp với DB schema VARCHAR)
export enum ReportTypeEnum {
  INAPPROPRIATE_CONTENT = 'INAPPROPRIATE_CONTENT',
  SPAM = 'SPAM',
  HARASSMENT = 'HARASSMENT',
  FRAUD = 'FRAUD',
  FAKE_PROFILE = 'FAKE_PROFILE',
  OTHER = 'OTHER',
}

// Mức độ nghiêm trọng
export enum ReportSeverityEnum {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
}

// DTO tạo report từ member
export class CreateReportDto {
  @ApiProperty({ 
    example: 'SPAM', 
    enum: ReportTypeEnum,
    description: 'Loại vi phạm' 
  })
  @IsEnum(ReportTypeEnum)
  report_type: ReportTypeEnum;

  @ApiProperty({ 
    example: 'test-member-bob', 
    description: 'Member ID của người bị report' 
  })
  @IsUUID()
  reported_member_id: string;

  @ApiPropertyOptional({ 
    example: 'BOOK', 
    description: 'Loại đối tượng cụ thể bị report (BOOK, REVIEW, MESSAGE, etc.)' 
  })
  @IsOptional()
  @IsString()
  reported_item_type?: string;

  @ApiPropertyOptional({ 
    example: 'seed-book-diego-pp', 
    description: 'ID của đối tượng cụ thể bị report' 
  })
  @IsOptional()
  @IsUUID()
  reported_item_id?: string;

  @ApiProperty({ 
    example: 'Người này đăng sách với nội dung spam quảng cáo không liên quan', 
    description: 'Mô tả chi tiết về vi phạm' 
  })
  @IsString()
  @MinLength(10, { message: 'Mô tả phải có ít nhất 10 ký tự' })
  description: string;

  @ApiPropertyOptional({ 
    example: 'MEDIUM', 
    enum: ReportSeverityEnum,
    description: 'Mức độ nghiêm trọng của vi phạm (LOW, MEDIUM, HIGH)' 
  })
  @IsOptional()
  @IsEnum(ReportSeverityEnum)
  severity?: ReportSeverityEnum;

  @ApiPropertyOptional({ 
    example: ['https://example.com/evidence1.jpg', 'https://example.com/evidence2.png'],
    description: 'Danh sách URLs của bằng chứng (ảnh, tài liệu)' 
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence_urls?: string[];
}

// Response DTO khi tạo report thành công
export class ReportResponseDto {
  report_id: string;
  status: string;
  message: string;
  created_at: Date;
}
