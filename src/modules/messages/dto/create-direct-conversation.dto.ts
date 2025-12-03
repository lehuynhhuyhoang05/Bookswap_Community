// src/modules/messages/dto/create-direct-conversation.dto.ts
import { IsUUID, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDirectConversationDto {
  @ApiProperty({
    description: 'User ID của người muốn nhắn tin (receiver)',
    example: 'user-uuid-123',
  })
  @IsNotEmpty({ message: 'receiver_user_id is required' })
  @IsUUID('4', { message: 'receiver_user_id must be a valid UUID' })
  receiver_user_id: string;
}
