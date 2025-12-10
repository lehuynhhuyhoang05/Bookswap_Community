import { Controller, Post, Body } from '@nestjs/common';
import { NotificationsService } from '../services/notifications.service';

@Controller('api/notifications/test')
export class TestNotificationController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Post()
  async sendTestNotification(@Body() body: { member_id: string }) {
    const { member_id } = body;
    
    await this.notificationsService.create(
      member_id,
      'EXCHANGE_REQUEST',
      {
        message: '🎉 TEST: Bạn có yêu cầu trao đổi mới từ Test User!',
        requester_name: 'Test User',
        book_count: 2,
      },
    );

    return { success: true, message: 'Test notification sent!' };
  }
}
