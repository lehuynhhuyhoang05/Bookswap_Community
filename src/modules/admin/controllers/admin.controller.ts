// ============================================================
// src/modules/admin/controllers/admin.controller.ts
// Controller chính của Admin System (User Management, Content Moderation, Statistics)
// ============================================================
import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiParam, ApiQuery } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { Admin } from '../../../common/decorators/admin.decorator';
import { CurrentAdmin } from '../../../common/decorators/current-admin.decorator';
import { AdminService } from '../services/admin.service';
import {
  QueryUsersDto,
  LockUserDto,
  UnlockUserDto,
  DeleteUserDto,
  UpdateUserRoleDto,
  UpdateUserInfoDto,
} from '../dto/user-management.dto';
import { QueryBooksDto, RemoveBookDto, RestoreBookDto, BatchRemoveBooksDto, QueryReviewsDto, RemoveReviewDto } from '../dto/content-moderation.dto';
import { QueryExchangesDto, CancelExchangeDto } from '../dto/exchange-management.dto';
import { QueryMessagesDto, RemoveMessageDto } from '../dto/messaging-moderation.dto';
import { QueryUserActivitiesDto, QueryUserActivityStatsDto } from '../dto/user-activity.dto';
import { QuerySuspiciousActivitiesDto } from '../dto/suspicious-activity.dto';
import { AdjustTrustScoreDto } from '../dto/trust-score-management.dto';

@ApiTags('🔧 ADMIN - Quản lý hệ thống')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  @Get('users')
  @ApiOperation({ 
    summary: '📋 Lấy danh sách người dùng',
    description: 'Xem tất cả users trong hệ thống với filters: status, role, search. Hỗ trợ phân trang.'
  })
  @ApiResponse({ status: 200, description: 'Danh sách users thành công' })
  async getUsers(@Query() dto: QueryUsersDto) {
    return this.adminService.getUsers(dto);
  }

  @Get('users/:userId')
  @ApiOperation({ 
    summary: '👤 Xem chi tiết người dùng',
    description: 'Xem thông tin đầy đủ của 1 user: profile, member info, account status, statistics.'
  })
  @ApiResponse({ status: 200, description: 'Chi tiết user' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async getUserDetail(@Param('userId') userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Post('users/:userId/lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🔒 Khóa tài khoản người dùng',
    description: 'Khóa tài khoản user khi vi phạm (LOCKED). User không thể đăng nhập. Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Khóa tài khoản thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async lockUser(
    @Param('userId') userId: string,
    @Body() dto: LockUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.lockUser(userId, dto, admin.sub, admin.email);
  }

  @Post('users/:userId/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🔓 Mở khóa tài khoản người dùng',
    description: 'Mở khóa tài khoản user đã bị khóa (chuyển về ACTIVE). Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Mở khóa thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async unlockUser(
    @Param('userId') userId: string,
    @Body() dto: UnlockUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.unlockUser(userId, dto, admin.sub, admin.email);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🗑️ Xóa người dùng (soft delete)',
    description: 'Xóa tài khoản user vĩnh viễn (DELETED). Chỉ dùng cho trường hợp nghiêm trọng. Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Xóa user thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async deleteUser(
    @Param('userId') userId: string,
    @Body() dto: DeleteUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.deleteUser(userId, dto, admin.sub, admin.email);
  }

  @Put('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '👑 Thay đổi quyền người dùng',
    description: 'Thay đổi role của user (USER → ADMIN hoặc ngược lại). Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật role thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.updateUserRole(userId, dto, admin.sub, admin.email);
  }

  @Patch('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '✏️ Cập nhật thông tin người dùng',
    description: 'Admin có thể cập nhật thông tin cơ bản của user: full_name, email, phone, region, bio'
  })
  @ApiResponse({ status: 200, description: 'Cập nhật thành công' })
  @ApiResponse({ status: 404, description: 'User không tồn tại' })
  async updateUserInfo(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserInfoDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.updateUserInfo(userId, dto, admin.sub, admin.email);
  }

  // ============================================================
  // CONTENT MODERATION
  // ============================================================

  @Get('books')
  @ApiOperation({ 
    summary: '📚 Lấy danh sách sách',
    description: 'Xem tất cả sách trong hệ thống với filters: status, category, region. Admin có thể thấy cả sách đã xóa.'
  })
  @ApiResponse({ status: 200, description: 'Danh sách sách' })
  async getBooks(@Query() dto: QueryBooksDto) {
    return this.adminService.getBooks(dto);
  }

  @Delete('books/:bookId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🗑️ Xóa sách vi phạm',
    description: 'Xóa sách vi phạm nội dung hoặc chất lượng kém (soft delete). Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Xóa sách thành công' })
  @ApiResponse({ status: 404, description: 'Sách không tồn tại' })
  async removeBook(
    @Param('bookId') bookId: string,
    @Body() dto: RemoveBookDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.removeBook(bookId, dto, admin.sub, admin.email);
  }

  @Put('books/:bookId/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '♻️ Khôi phục sách đã xóa',
    description: 'Khôi phục sách đã bị xóa nhầm hoặc sau khi user khiếu nại. Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Khôi phục sách thành công' })
  @ApiResponse({ status: 404, description: 'Sách không tồn tại' })
  @ApiResponse({ status: 400, description: 'Chỉ có thể khôi phục sách có status REMOVED' })
  async restoreBook(
    @Param('bookId') bookId: string,
    @Body() dto: RestoreBookDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.restoreBook(bookId, dto, admin.sub, admin.email);
  }

  @Post('books/batch-remove')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🗑️🗑️ Xóa hàng loạt sách',
    description: 'Xóa nhiều sách cùng lúc (tối đa 50). Hữu ích khi phát hiện spam từ cùng 1 user.'
  })
  @ApiResponse({ status: 200, description: 'Batch remove completed with success/failure counts' })
  async batchRemoveBooks(
    @Body() dto: BatchRemoveBooksDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.batchRemoveBooks(dto, admin.sub, admin.email);
  }

  @Get('books/:bookId')
  @ApiOperation({ 
    summary: '📖 Xem chi tiết sách',
    description: 'Xem đầy đủ thông tin sách, danh sách reports, lịch sử giao dịch.'
  })
  @ApiResponse({ status: 200, description: 'Chi tiết sách với reports và exchange history' })
  @ApiResponse({ status: 404, description: 'Sách không tồn tại' })
  async getBookDetail(@Param('bookId') bookId: string) {
    return this.adminService.getBookDetail(bookId);
  }


  @Get('reviews')
  @ApiOperation({ 
    summary: '⭐ Lấy danh sách đánh giá',
    description: 'Xem tất cả reviews trong hệ thống. Admin có thể thấy cả reviews đã xóa.'
  })
  @ApiResponse({ status: 200, description: 'Danh sách reviews' })
  async getReviews(@Query() dto: QueryReviewsDto) {
    return this.adminService.getReviews(dto);
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🗑️ Xóa đánh giá vi phạm',
    description: 'Xóa review vi phạm (spam, toxic, không đúng sự thật). Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Xóa review thành công' })
  @ApiResponse({ status: 404, description: 'Review không tồn tại' })
  async removeReview(
    @Param('reviewId') reviewId: string,
    @Body() dto: RemoveReviewDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.removeReview(reviewId, dto, admin.sub, admin.email);
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  @Get('dashboard/stats')
  @ApiOperation({ 
    summary: '📊 Thống kê tổng quan hệ thống',
    description: 'Dashboard statistics: tổng users, books, exchanges, reviews. Top active users, recent activities.'
  })
  @ApiResponse({ status: 200, description: 'Dashboard statistics' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }

  // ============================================================
  // EXCHANGE MANAGEMENT
  // ============================================================

  @Get('exchanges')
  @ApiOperation({ 
    summary: '🔄 Lấy danh sách giao dịch',
    description: 'Xem tất cả exchanges trong hệ thống. Admin có thể filter theo status, date range. Hỗ trợ phân trang.'
  })
  @ApiResponse({ status: 200, description: 'Danh sách exchanges' })
  async getExchanges(@Query() dto: QueryExchangesDto) {
    return this.adminService.getExchanges(dto);
  }

  @Get('exchanges/:exchangeId')
  @ApiOperation({ 
    summary: '🔍 Xem chi tiết giao dịch',
    description: 'Xem thông tin đầy đủ của 1 exchange: members, books, timeline, status history.'
  })
  @ApiResponse({ status: 200, description: 'Chi tiết exchange' })
  @ApiResponse({ status: 404, description: 'Exchange không tồn tại' })
  async getExchangeDetail(@Param('exchangeId') exchangeId: string) {
    return this.adminService.getExchangeDetail(exchangeId);
  }

  @Post('exchanges/:exchangeId/cancel')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '❌ Hủy giao dịch (admin force cancel)',
    description: 'Admin force cancel exchange khi phát hiện gian lận hoặc vi phạm. Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Hủy exchange thành công' })
  @ApiResponse({ status: 404, description: 'Exchange không tồn tại' })
  async cancelExchange(
    @Param('exchangeId') exchangeId: string,
    @Body() dto: CancelExchangeDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.cancelExchange(exchangeId, dto, admin.sub, admin.email);
  }

  @Get('exchanges/statistics/overview')
  @ApiOperation({ 
    summary: '📈 Thống kê giao dịch tổng quan',
    description: 'Thống kê exchanges: tổng số, completed, pending, cancelled. Tỷ lệ thành công, thời gian trung bình. Top 10 members.'
  })
  @ApiResponse({ status: 200, description: 'Exchange statistics' })
  async getExchangeStats() {
    return this.adminService.getExchangeStats();
  }

  // ============================================================
  // MESSAGING MODERATION
  // ============================================================

  @Get('messages')
  @ApiOperation({ 
    summary: '💬 Lấy danh sách tin nhắn',
    description: 'Admin xem tất cả messages trong hệ thống. Có thể filter theo conversation, sender, chỉ xem deleted messages.'
  })
  @ApiResponse({ status: 200, description: 'Danh sách messages' })
  async getMessages(@Query() dto: QueryMessagesDto) {
    return this.adminService.getMessages(dto);
  }

  @Get('conversations/:conversationId')
  @ApiOperation({ 
    summary: '💭 Xem chi tiết cuộc trò chuyện',
    description: 'Admin xem toàn bộ messages trong 1 conversation. Hiển thị cả messages đã xóa.'
  })
  @ApiResponse({ status: 200, description: 'Chi tiết conversation với tất cả messages' })
  @ApiResponse({ status: 404, description: 'Conversation không tồn tại' })
  async getConversationDetail(@Param('conversationId') conversationId: string) {
    return this.adminService.getConversationDetail(conversationId);
  }

  @Delete('messages/:messageId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: '🗑️ Xóa tin nhắn vi phạm',
    description: 'Xóa message vi phạm (spam, toxic, quấy rối). Soft delete, có thể xem lại. Cần có lý do trong body.'
  })
  @ApiResponse({ status: 200, description: 'Xóa message thành công' })
  @ApiResponse({ status: 404, description: 'Message không tồn tại' })
  async removeMessage(
    @Param('messageId') messageId: string,
    @Body() dto: RemoveMessageDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.removeMessage(messageId, dto, admin.sub, admin.email);
  }

  // ============================================================
  // USER ACTIVITY TRACKING
  // ============================================================

  @Get('users/:userId/activities')
  @ApiOperation({ 
    summary: '🔍 Xem lịch sử hoạt động người dùng',
    description: 'Admin xem tất cả hành động của user (login, create_book, exchange, message). Dùng để audit trail, phát hiện spam/scam. Hỗ trợ filter theo action type, date range.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID của user cần xem lịch sử',
    example: '88a84968-25da-4a89-bfc8-71d2cb0abfb1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Lịch sử hoạt động với pagination',
    schema: {
      example: {
        user: {
          user_id: "88a84968-25da-4a89-bfc8-71d2cb0abfba",
          email: "user@example.com",
          full_name: "User1"
        },
        items: [
          {
            log_id: "log-uuid-001",
            user_id: "88a84968-25da-4a89-bfc8-71d2cb0abfba",
            action: "LOGIN",
            entity_type: null,
            entity_id: null,
            metadata: { ip: "192.168.1.1", device: "Chrome on Windows" },
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0...",
            created_at: "2025-11-05T10:30:00.000Z"
          },
          {
            log_id: "log-uuid-002",
            user_id: "88a84968-25da-4a89-bfc8-71d2cb0abfba",
            action: "CREATE_BOOK",
            entity_type: "BOOK",
            entity_id: "book-uuid-123",
            metadata: { title: "Clean Code", author: "Robert Martin" },
            ip_address: "192.168.1.1",
            user_agent: "Mozilla/5.0...",
            created_at: "2025-11-05T10:35:00.000Z"
          }
        ],
        total: 45,
        page: 1,
        limit: 20,
        totalPages: 3
      }
    }
  })
  async getUserActivities(
    @Param('userId') userId: string,
    @Query() dto: QueryUserActivitiesDto,
  ) {
    return this.adminService.getUserActivities(userId, dto);
  }

  @Get('users/:userId/activity-stats')
  @ApiOperation({ 
    summary: '📊 Thống kê hoạt động người dùng',
    description: 'Thống kê số lượng actions theo loại (LOGIN, CREATE_BOOK, SEND_MESSAGE...) và theo ngày. Hữu ích để phát hiện spam, bot, hành vi bất thường.'
  })
  @ApiParam({ 
    name: 'userId', 
    description: 'ID của user cần xem thống kê',
    example: '88a84968-25da-4a89-bfc8-71d2cb0abfb1'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Thống kê hoạt động theo action type và daily',
    schema: {
      example: {
        user: {
          user_id: "88a84968-25da-4a89-bfc8-71d2cb0abfba",
          email: "user@example.com",
          full_name: "User1"
        },
        action_counts: [
          { action: "LOGIN", count: "15" },
          { action: "CREATE_BOOK", count: "8" },
          { action: "SEND_MESSAGE", count: "12" },
          { action: "CREATE_EXCHANGE_REQUEST", count: "5" },
          { action: "UPDATE_PROFILE", count: "2" }
        ],
        daily_activity: [
          { date: "2025-11-01", count: "8" },
          { date: "2025-11-02", count: "12" },
          { date: "2025-11-03", count: "5" },
          { date: "2025-11-04", count: "10" },
          { date: "2025-11-05", count: "7" }
        ],
        period_days: 30
      }
    }
  })
  async getUserActivityStats(
    @Param('userId') userId: string,
    @Query() dto: QueryUserActivityStatsDto,
  ) {
    return this.adminService.getUserActivityStats(userId, dto.days);
  }

  // ============================================================
  // SPAM/FRAUD DETECTION
  // ============================================================

  @Get('suspicious-activities')
  @ApiOperation({
    summary: '🚨 Phát hiện hoạt động đáng ngờ',
    description:
      'Phát hiện tự động các user có hành vi bất thường: spam books, spam messages, new account với activity cao, trust score giảm mạnh, nhiều reports.',
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách users đáng ngờ với severity và chi tiết',
    schema: {
      example: {
        items: [
          {
            user_id: '88a84968-25da-4a89-bfc8-71d2cb0abfba',
            email: 'spammer@example.com',
            full_name: 'Suspicious User',
            account_status: 'ACTIVE',
            trust_score: 25.0,
            suspicious_type: 'HIGH_BOOK_CREATION',
            severity: 'HIGH',
            details: {
              book_count: 15,
              time_span_hours: 1,
            },
            detected_at: '2025-12-05T10:00:00.000Z',
          },
        ],
        total: 5,
        page: 1,
        limit: 20,
        totalPages: 1,
        summary: {
          total_suspicious_users: 5,
          high_severity: 2,
          medium_severity: 3,
          by_type: {
            high_book_creation: 2,
            high_message_volume: 1,
            new_account_high_activity: 1,
            trust_score_drop: 0,
            multiple_reports: 1,
          },
        },
      },
    },
  })
  async getSuspiciousActivities(@Query() dto: QuerySuspiciousActivitiesDto) {
    return this.adminService.getSuspiciousActivities(dto);
  }

  // ============================================================
  // TRUST SCORE MANAGEMENT
  // ============================================================

  @Get('members/:memberId/trust-score-history')
  @ApiOperation({
    summary: '📊 Xem lịch sử trust score',
    description:
      'Lấy toàn bộ lịch sử thay đổi trust score của member (system + admin adjustments)',
  })
  @ApiParam({
    name: 'memberId',
    description: 'ID của member',
    example: '88a84968-25da-4a89-bfc8-71d2cb0abfba',
  })
  @ApiResponse({
    status: 200,
    description: 'Lịch sử trust score với thông tin chi tiết',
    schema: {
      example: {
        member: {
          member_id: '88a84968-25da-4a89-bfc8-71d2cb0abfba',
          user_id: 'user-uuid',
          email: 'user@example.com',
          full_name: 'User Name',
          current_trust_score: 75.5,
        },
        history: [
          {
            change_id: 'change-uuid-001',
            old_score: 77.5,
            new_score: 75.5,
            change_amount: -2.0,
            reason: 'Exchange cancelled',
            source: 'SYSTEM',
            admin_id: null,
            admin_name: null,
            created_at: '2025-12-05T10:00:00.000Z',
          },
          {
            change_id: 'change-uuid-002',
            old_score: 75.5,
            new_score: 77.5,
            change_amount: 2.0,
            reason: 'Exchange completed successfully',
            source: 'SYSTEM',
            admin_id: null,
            admin_name: null,
            created_at: '2025-12-04T15:30:00.000Z',
          },
        ],
        total_changes: 2,
      },
    },
  })
  async getTrustScoreHistory(@Param('memberId') memberId: string) {
    return this.adminService.getTrustScoreHistory(memberId);
  }

  @Post('members/:memberId/adjust-trust-score')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✏️ Admin điều chỉnh trust score',
    description:
      'Admin thủ công tăng/giảm trust score của member. Dùng khi phát hiện gian lận hoặc muốn thưởng user.',
  })
  @ApiParam({
    name: 'memberId',
    description: 'ID của member cần điều chỉnh',
    example: '88a84968-25da-4a89-bfc8-71d2cb0abfba',
  })
  @ApiResponse({
    status: 200,
    description: 'Điều chỉnh trust score thành công',
  })
  @ApiResponse({
    status: 404,
    description: 'Member không tồn tại',
  })
  async adjustTrustScore(
    @Param('memberId') memberId: string,
    @Body() dto: AdjustTrustScoreDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.adjustTrustScore(
      memberId,
      dto,
      admin.sub,
      admin.email,
    );
  }

  @Get('trust-score-leaderboard')
  @ApiOperation({
    summary: '🏆 Trust Score Leaderboard',
    description:
      'Xem top members có trust score cao nhất trong hệ thống. Mặc định top 50.',
  })
  @ApiQuery({
    name: 'limit',
    description: 'Số lượng members hiển thị',
    required: false,
    example: 50,
  })
  @ApiResponse({
    status: 200,
    description: 'Danh sách top members',
    schema: {
      example: {
        leaderboard: [
          {
            rank: 1,
            member_id: 'member-uuid-001',
            user_id: 'user-uuid-001',
            email: 'topuser@example.com',
            full_name: 'Top User',
            trust_score: 95.5,
            region: 'Hồ Chí Minh',
          },
        ],
        total: 50,
      },
    },
  })
  async getTrustScoreLeaderboard(@Query('limit') limit?: number) {
    return this.adminService.getTrustScoreLeaderboard(limit || 50);
  }

  // ============================================================
  // SYSTEM REPORTS - BÁO CÁO TỔNG THỂ HỆ THỐNG
  // ============================================================

  @Get('reports/system/overview')
  @ApiOperation({
    summary: '📊 Báo cáo tổng quan hệ thống',
    description: 'Thống kê tổng quan: users, books, exchanges, reports, reviews, messages.',
  })
  @ApiResponse({ status: 200, description: 'System overview statistics' })
  async getSystemOverview() {
    return this.adminService.getSystemOverview();
  }

  @Get('reports/system/trends')
  @ApiOperation({
    summary: '📈 Báo cáo xu hướng theo thời gian',
    description: 'Thống kê xu hướng new users, books, exchanges theo ngày. Mặc định 30 ngày.',
  })
  @ApiQuery({ name: 'days', description: 'Số ngày thống kê (7, 30, 90)', required: false, example: 30 })
  @ApiResponse({ status: 200, description: 'System trends data' })
  async getSystemTrends(@Query('days') days?: number) {
    return this.adminService.getSystemTrends(days || 30);
  }

  @Get('reports/system/regions')
  @ApiOperation({
    summary: '📍 Báo cáo theo vùng địa lý',
    description: 'Thống kê members, books, exchanges, trust score theo từng vùng.',
  })
  @ApiResponse({ status: 200, description: 'Region report data' })
  async getRegionReport() {
    return this.adminService.getRegionReport();
  }

  @Get('reports/system/categories')
  @ApiOperation({
    summary: '📚 Báo cáo sách theo thể loại',
    description: 'Thống kê số lượng sách theo từng category.',
  })
  @ApiResponse({ status: 200, description: 'Book category report' })
  async getBookCategoryReport() {
    return this.adminService.getBookCategoryReport();
  }

  @Get('reports/system/top-performers')
  @ApiOperation({
    summary: '🏆 Top performers report',
    description: 'Top users theo exchanges, books contributed, reviews, highest rated.',
  })
  @ApiResponse({ status: 200, description: 'Top performers data' })
  async getTopPerformersReport() {
    return this.adminService.getTopPerformersReport();
  }

  @Get('reports/system/alerts')
  @ApiOperation({
    summary: '⚠️ System alerts',
    description: 'Các cảnh báo hệ thống: pending reports, stale exchanges, low trust users, etc.',
  })
  @ApiResponse({ status: 200, description: 'System alerts' })
  async getSystemAlerts() {
    return this.adminService.getSystemAlerts();
  }

  @Get('reports/system/full')
  @ApiOperation({
    summary: '📊 Full system report',
    description: 'Báo cáo đầy đủ hệ thống bao gồm tất cả các thống kê.',
  })
  @ApiResponse({ status: 200, description: 'Full system report' })
  async getFullSystemReport() {
    return this.adminService.getFullSystemReport();
  }
}

