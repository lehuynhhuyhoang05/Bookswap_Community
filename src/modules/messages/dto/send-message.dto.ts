// src/modules/messages/dto/send-message.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, ValidateIf, IsEmpty, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class SendMessageDto {
  @ApiProperty({
    description: 'Conversation ID (optional if exchange_request_id provided)',
    example: 'conv-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'conversation_id must be a valid UUID' })
  conversation_id?: string;

  @ApiProperty({
    description: 'Exchange Request ID (to start new conversation)',
    example: 'request-uuid-123',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'exchange_request_id must be a valid UUID' })
  exchange_request_id?: string;

  @ApiProperty({
    description: 'Receiver Member ID (to start direct conversation, e.g., from book detail)',
    example: 'member-uuid-456',
    required: false,
  })
  @IsOptional()
  @IsUUID('4', { message: 'receiver_member_id must be a valid UUID' })
  receiver_member_id?: string;

  @ApiProperty({
    description: 'Message content',
    example: 'Hi! Is the book still available?',
    maxLength: 2000,
  })
  @IsString({ message: 'content must be a string' })
  @IsNotEmpty({ message: 'content is required' })
  @MinLength(1, { message: 'content must not be empty' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content: string;

  // Custom validation: must provide either conversation_id, exchange_request_id, or receiver_member_id
  @ValidateIf((obj) => !obj.conversation_id && !obj.exchange_request_id && !obj.receiver_member_id)
  @IsNotEmpty({ message: 'Must provide either conversation_id, exchange_request_id, or receiver_member_id' })
  _validateEither?: any;

  // Reject if content is only whitespace
  @ValidateIf((obj) => typeof obj.content === 'string' && obj.content.trim().length === 0)
  @IsEmpty({ message: 'content cannot be only whitespace' })
  _validateWhitespace?: any;
}