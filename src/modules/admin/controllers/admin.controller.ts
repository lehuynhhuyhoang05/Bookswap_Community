// ============================================================
// src/modules/admin/controllers/admin.controller.ts
// Controller chính của Admin System (User Management, Content Moderation, Statistics)
// ============================================================
import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
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
} from '../dto/user-management.dto';
import { QueryBooksDto, RemoveBookDto, QueryReviewsDto, RemoveReviewDto } from '../dto/content-moderation.dto';

@ApiTags('Admin - Management')
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
  @ApiOperation({ summary: 'Lấy danh sách users' })
  @ApiResponse({ status: 200, description: 'Danh sách users' })
  async getUsers(@Query() dto: QueryUsersDto) {
    return this.adminService.getUsers(dto);
  }

  @Get('users/:userId')
  @ApiOperation({ summary: 'Xem chi tiết 1 user' })
  @ApiResponse({ status: 200, description: 'Chi tiết user' })
  async getUserDetail(@Param('userId') userId: string) {
    return this.adminService.getUserDetail(userId);
  }

  @Post('users/:userId/lock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Khóa tài khoản user' })
  @ApiResponse({ status: 200, description: 'User bị khóa thành công' })
  async lockUser(
    @Param('userId') userId: string,
    @Body() dto: LockUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.lockUser(userId, dto, admin.sub, admin.email);
  }

  @Post('users/:userId/unlock')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mở khóa tài khoản user' })
  @ApiResponse({ status: 200, description: 'User được mở khóa thành công' })
  async unlockUser(
    @Param('userId') userId: string,
    @Body() dto: UnlockUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.unlockUser(userId, dto, admin.sub, admin.email);
  }

  @Delete('users/:userId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa user (soft delete)' })
  @ApiResponse({ status: 200, description: 'User bị xóa thành công' })
  async deleteUser(
    @Param('userId') userId: string,
    @Body() dto: DeleteUserDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.deleteUser(userId, dto, admin.sub, admin.email);
  }

  @Put('users/:userId/role')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Thay đổi role của user' })
  @ApiResponse({ status: 200, description: 'Role được cập nhật thành công' })
  async updateUserRole(
    @Param('userId') userId: string,
    @Body() dto: UpdateUserRoleDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.updateUserRole(userId, dto, admin.sub, admin.email);
  }

  // ============================================================
  // CONTENT MODERATION
  // ============================================================

  @Get('books')
  @ApiOperation({ summary: 'Lấy danh sách books' })
  @ApiResponse({ status: 200, description: 'Danh sách books' })
  async getBooks(@Query() dto: QueryBooksDto) {
    return this.adminService.getBooks(dto);
  }

  @Delete('books/:bookId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa book (soft delete)' })
  @ApiResponse({ status: 200, description: 'Book bị xóa thành công' })
  async removeBook(
    @Param('bookId') bookId: string,
    @Body() dto: RemoveBookDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.removeBook(bookId, dto, admin.sub, admin.email);
  }

  @Get('reviews')
  @ApiOperation({ summary: 'Lấy danh sách reviews' })
  @ApiResponse({ status: 200, description: 'Danh sách reviews' })
  async getReviews(@Query() dto: QueryReviewsDto) {
    return this.adminService.getReviews(dto);
  }

  @Delete('reviews/:reviewId')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Xóa review' })
  @ApiResponse({ status: 200, description: 'Review bị xóa thành công' })
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
  @ApiOperation({ summary: 'Lấy dashboard statistics' })
  @ApiResponse({ status: 200, description: 'Dashboard stats' })
  async getDashboardStats() {
    return this.adminService.getDashboardStats();
  }
}
