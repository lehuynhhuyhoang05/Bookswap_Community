// src/modules/messages/dto/upload-attachment.dto.ts
import { IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UploadAttachmentDto {
  @ApiProperty({ 
    description: 'Conversation ID (optional)',
    required: false 
  })
  @IsOptional()
  @IsUUID()
  conversation_id?: string;
}
