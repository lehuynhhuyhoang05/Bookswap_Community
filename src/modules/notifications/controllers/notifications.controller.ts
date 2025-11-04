import { Controller, Get, UseGuards, Request, Query, Patch, Param, Post, Body, DefaultValuePipe, ParseIntPipe, ParseUUIDPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationsService } from '../services/notifications.service';
import { GetNotificationsDto } from '../dto/get-notifications.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications (paginated)' })
  async list(@Request() req, @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number, @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number) {
    const memberId = req.user.memberId ?? req.user.userId;
    return this.notificationsService.findForMember(memberId, page, pageSize);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  async markRead(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    const memberId = req.user.memberId ?? req.user.userId;
    return this.notificationsService.markRead(id, memberId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAll(@Request() req) {
    const memberId = req.user.memberId ?? req.user.userId;
    return this.notificationsService.markAllRead(memberId);
  }

  // Test helper: create a notification for current user (useful for manual testing)
  @Post('test')
  @ApiBody({ schema: { properties: { type: { type: 'string' }, payload: { type: 'object' } } } })
  @ApiOperation({ summary: 'Create a test notification for current user (dev only)' })
  async createTest(@Request() req, @Body() body: { type: string; payload?: any }) {
    const memberId = req.user.memberId ?? req.user.userId;
    return this.notificationsService.create(memberId, body.type || 'TEST', body.payload || null);
  }
}
