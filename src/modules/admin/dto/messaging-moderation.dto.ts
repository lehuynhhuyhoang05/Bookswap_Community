// ============================================================
// src/modules/admin/dto/messaging-moderation.dto.ts
// DTOs cho Messaging Moderation
// ============================================================
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsInt, Min, Max, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

// DTO query messages (admin view)
export class QueryMessagesDto {
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

  @ApiPropertyOptional({ example: 'conversation-uuid-001', description: 'Lọc theo conversation_id' })
  @IsOptional()
  @IsString()
  conversationId?: string;

  @ApiPropertyOptional({ example: 'member-uuid-001', description: 'Lọc theo sender_id' })
  @IsOptional()
  @IsString()
  senderId?: string;

  @ApiPropertyOptional({ example: true, description: 'Chỉ hiện messages bị xóa (soft deleted)' })
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  deletedOnly?: boolean;

  @ApiPropertyOptional({ example: 'spam keyword', description: 'Tìm kiếm trong content' })
  @IsOptional()
  @IsString()
  search?: string;
}

// DTO remove message
export class RemoveMessageDto {
  @ApiProperty({ example: 'Message chứa nội dung vi phạm, spam quảng cáo', description: 'Lý do xóa message' })
  @IsString()
  reason: string;
}
