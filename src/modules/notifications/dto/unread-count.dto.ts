import { ApiProperty } from '@nestjs/swagger';

export class UnreadCountDto {
  @ApiProperty({ example: 5, description: 'Number of unread notifications' })
  unread: number;
}
