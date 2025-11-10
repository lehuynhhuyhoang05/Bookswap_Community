import { ApiProperty } from '@nestjs/swagger';
import { NotificationDto } from './notification.dto';

export class PaginatedNotificationsDto {
  @ApiProperty({ type: [NotificationDto] })
  items: NotificationDto[];

  @ApiProperty({ example: 42 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 20 })
  pageSize: number;
}
