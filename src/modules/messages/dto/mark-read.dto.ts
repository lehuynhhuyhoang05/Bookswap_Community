// src/modules/messages/dto/mark-read.dto.ts
import { IsUUID, IsArray, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class MarkReadDto {
  @ApiProperty({
    description: 'Array of message IDs to mark as read',
    example: ['msg-uuid-1', 'msg-uuid-2'],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  message_ids?: string[];
}