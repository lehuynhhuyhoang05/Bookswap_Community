// src/modules/messages/dto/reaction.dto.ts
import { IsString, IsNotEmpty, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddReactionDto {
  @ApiProperty({
    description: 'Emoji reaction (must be a valid emoji character)',
    example: '👍',
  })
  @IsString({ message: 'emoji must be a string' })
  @IsNotEmpty({ message: 'emoji is required' })
  @Matches(/^[\p{Emoji_Presentation}\p{Extended_Pictographic}]$/u, {
    message: 'emoji must be a valid single emoji character',
  })
  emoji: string;
}

export class ReactionResponseDto {
  reaction_id: string;
  message_id: string;
  member_id: string;
  emoji: string;
  created_at: Date;
}

export class MessageReactionSummaryDto {
  emoji: string;
  count: number;
  members: string[]; // List of member_ids who reacted with this emoji
  current_user_reacted: boolean;
}
