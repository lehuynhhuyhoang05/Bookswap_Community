// ============================================================
// src/modules/admin/controllers/reports.controller.ts
// Controller riêng cho Report System (tách ra để dễ quản lý)
// ============================================================
import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Admin } from '../../../common/decorators/admin.decorator';
import { CurrentAdmin } from '../../../common/decorators/current-admin.decorator';
import { AdminGuard } from '../../../common/guards/admin.guard';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import {
  DismissReportDto,
  QueryReportsDto,
  ResolveReportDto,
} from '../dto/report-management.dto';
import { AdminService } from '../services/admin.service';

@ApiTags('🚨 ADMIN - Quản lý báo cáo vi phạm')
@ApiBearerAuth()
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class ReportsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({
    summary: '🚨 Lấy danh sách báo cáo vi phạm',
    description:
      'Xem tất cả reports trong hệ thống. Filter theo status (PENDING/RESOLVED/DISMISSED), priority (HIGH/MEDIUM/LOW), entity type. Hỗ trợ phân trang.',
  })
  @ApiResponse({ status: 200, description: 'Danh sách reports' })
  async getReports(@Query() dto: QueryReportsDto) {
    return this.adminService.getReports(dto);
  }

  @Get(':reportId')
  @ApiOperation({
    summary: '🔍 Xem chi tiết báo cáo',
    description:
      'Xem thông tin đầy đủ của 1 report: reporter info, target entity, reason, evidence, status history.',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết report' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async getReportDetail(@Param('reportId') reportId: string) {
    return this.adminService.getReportDetail(reportId);
  }

  @Post(':reportId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '✅ Xử lý báo cáo (đã giải quyết)',
    description:
      'Resolve report - xác nhận vi phạm và đã xử lý (khóa user, xóa content...). Cần có action_taken trong body.',
  })
  @ApiResponse({ status: 200, description: 'Resolve report thành công' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @CurrentAdmin() admin: any,
  ) {
    console.log('[ReportsController] Resolve Report Called:', {
      reportId,
      dto,
      admin: admin.email,
    });
    return this.adminService.resolveReport(
      reportId,
      dto,
      admin.sub,
      admin.email,
    );
  }

  @Post(':reportId/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: '❌ Bác bỏ báo cáo (không vi phạm)',
    description:
      'Dismiss report - xác nhận không có vi phạm hoặc report sai. Cần có lý do trong body.',
  })
  @ApiResponse({ status: 200, description: 'Dismiss report thành công' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async dismissReport(
    @Param('reportId') reportId: string,
    @Body() dto: DismissReportDto,
    @CurrentAdmin() admin: any,
  ) {
    console.log('[ReportsController] Dismiss Report Called:', {
      reportId,
      dto,
      admin: admin.email,
    });
    return this.adminService.dismissReport(
      reportId,
      dto,
      admin.sub,
      admin.email,
    );
  }
}
