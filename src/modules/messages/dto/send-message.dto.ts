// src/modules/messages/dto/send-message.dto.ts
import { IsString, IsNotEmpty, MaxLength, IsOptional, IsUUID, ValidateIf, IsEmpty, MinLength, IsEnum, IsInt } from 'class-validator';
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
    description: 'Message content',
    example: 'Hi! Is the book still available?',
    maxLength: 2000,
    required: false,
  })
  @IsOptional()
  @IsString({ message: 'content must be a string' })
  @ValidateIf((obj) => obj.content && obj.content.length > 0)
  @MinLength(1, { message: 'content must not be empty' })
  @MaxLength(2000, { message: 'content must not exceed 2000 characters' })
  content?: string;

  @ApiProperty({
    description: 'Attachment URL (from upload endpoint)',
    example: '/uploads/messages/abc123.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment_url?: string;

  @ApiProperty({
    description: 'Attachment type',
    enum: ['image', 'file'],
    required: false,
  })
  @IsOptional()
  @IsEnum(['image', 'file'])
  attachment_type?: 'image' | 'file';

  @ApiProperty({
    description: 'Original filename',
    example: 'my-photo.jpg',
    required: false,
  })
  @IsOptional()
  @IsString()
  attachment_name?: string;

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    required: false,
  })
  @IsOptional()
  @IsInt()
  attachment_size?: number;

  // Custom validation: must provide either conversation_id or exchange_request_id
  @ValidateIf((obj) => !obj.conversation_id && !obj.exchange_request_id)
  @IsNotEmpty({ message: 'Must provide either conversation_id or exchange_request_id' })
  _validateEither?: any;

  // Content or attachment required
  @ValidateIf((obj) => !obj.content && !obj.attachment_url)
  @IsNotEmpty({ message: 'Must provide either content or attachment' })
  _validateContentOrAttachment?: any;
}