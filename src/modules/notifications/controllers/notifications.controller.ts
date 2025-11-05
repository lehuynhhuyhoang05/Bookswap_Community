import {
  Controller,
  Get,
  UseGuards,
  Request,
  Query,
  Patch,
  Param,
  Post,
  Body,
  DefaultValuePipe,
  ParseIntPipe,
  ParseUUIDPipe,
  Delete,
  ParseBoolPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody, ApiQuery, ApiResponse } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { NotificationsService } from '../services/notifications.service';
import { PaginatedNotificationsDto } from '../dto/paginated-notifications.dto';
import { UnreadCountDto } from '../dto/unread-count.dto';
import { NotificationDto } from '../dto/notification.dto';

@ApiTags('Notifications')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('api/v1/notifications')
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  @Get()
  @ApiOperation({ summary: 'Get current user notifications (paginated, with filters)' })
  @ApiResponse({ status: 200, description: 'Paginated notifications list', type: PaginatedNotificationsDto })
  @ApiQuery({ name: 'page', required: false, type: Number, example: 1 })
  @ApiQuery({ name: 'pageSize', required: false, type: Number, example: 20 })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by notification type' })
  @ApiQuery({ name: 'onlyUnread', required: false, type: Boolean, description: 'Show only unread notifications' })
  async list(
    @Request() req,
    @Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number,
    @Query('pageSize', new DefaultValuePipe(20), ParseIntPipe) pageSize: number,
    @Query('type') type?: string,
    @Query('onlyUnread') onlyUnread?: string,
  ) {
    // Prioritize memberId from JWT payload
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.findForMember(memberId, page, pageSize, {
      type,
      onlyUnread: onlyUnread === 'true',
    });
  }

  @Get('unread/count')
  @ApiOperation({ summary: 'Get unread notification count for current user' })
  @ApiResponse({ status: 200, description: 'Unread count', type: UnreadCountDto })
  async unreadCount(@Request() req) {
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.unreadCount(memberId);
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark a notification as read' })
  @ApiResponse({ status: 200, description: 'Updated notification', type: NotificationDto })
  async markRead(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.markRead(id, memberId);
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read for current user' })
  async markAll(@Request() req) {
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.markAllRead(memberId);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Archive (soft delete) a notification' })
  async archive(@Request() req, @Param('id', new ParseUUIDPipe()) id: string) {
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.archive(id, memberId);
  }

  @Post('test')
  @ApiBody({
    schema: {
      properties: {
        type: { type: 'string', example: 'TEST' },
        payload: { type: 'object', example: { message: 'Hello World' } },
      },
    },
  })
  @ApiOperation({ summary: 'Create a test notification for current user (dev only)' })
  async createTest(@Request() req, @Body() body: { type?: string; payload?: any }) {
    const memberId = req.user?.memberId ?? req.user?.sub ?? req.user?.userId;
    return this.notificationsService.create(
      memberId,
      body?.type ?? 'TEST',
      body?.payload ?? { message: 'Test notification' },
    );
  }
}
