// src/modules/messages/dto/search-messages.dto.ts
import { IsString, IsNotEmpty, IsUUID, IsInt, Min, Max, IsOptional, MinLength } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class SearchMessagesDto {
  @ApiProperty({
    description: 'Search query (minimum 2 characters)',
    example: 'book',
  })
  @IsString({ message: 'q must be a string' })
  @IsNotEmpty({ message: 'q is required' })
  @MinLength(2, { message: 'Search query must be at least 2 characters' })
  q: string;

  @ApiProperty({
    description: 'Conversation ID to search in',
    example: 'conv-uuid-123',
  })
  @IsUUID('4', { message: 'conversation_id must be a valid UUID' })
  @IsNotEmpty({ message: 'conversation_id is required' })
  conversation_id: string;

  @ApiProperty({
    description: 'Page number',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'page must be an integer' })
  @Min(1, { message: 'page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Results per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'limit must be an integer' })
  @Min(1, { message: 'limit must be at least 1' })
  @Max(100, { message: 'limit must not exceed 100' })
  limit?: number = 20;
}
