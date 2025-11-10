import { ApiProperty } from '@nestjs/swagger';

export class NotificationDto {
  @ApiProperty({ example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890' })
  notification_id: string;

  @ApiProperty({ example: 'test-member-1' })
  member_id: string;

  @ApiProperty({ example: 'EXCHANGE_REQUEST', description: 'Type of notification' })
  notification_type: string;

  @ApiProperty({
    example: { exchange_id: 'ex-123', from_member: { id: 'm-456', name: 'John Doe' } },
    nullable: true,
    description: 'Flexible JSON payload',
  })
  payload?: Record<string, any> | null;

  @ApiProperty({ example: false })
  is_read: boolean;

  @ApiProperty({ example: '2025-11-05T10:30:00Z', nullable: true })
  read_at?: Date | null;

  @ApiProperty({ example: '2025-11-05T10:00:00Z' })
  created_at: Date;

  @ApiProperty({ example: '2025-11-05T10:00:00Z' })
  updated_at: Date;
}
