// src/modules/messages/dto/send-message.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation ID (optional if exchange_request_id provided)',
    example: 'conv-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  conversation_id?: string;

  @ApiProperty({
    description: 'Exchange Request ID (to start new conversation)',
    example: 'request-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  exchange_request_id?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hi! Is the book still available?',
    maxLength: 2000,
  })
  @IsString()
  @IsNotEmpty()
  @MaxLength(2000, { message: 'Message must not exceed 2000 characters' })
  content: string;
}