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
    summary: 'Lấy danh sách báo cáo vi phạm',
    description:
      'Xem tất cả báo cáo vi phạm trong hệ thống. Hỗ trợ lọc theo trạng thái, độ ưu tiên, loại vi phạm, người báo cáo, và phân trang.',
  })
  @ApiResponse({ status: 200, description: 'Trả về danh sách reports' })
  async getReports(@Query() dto: QueryReportsDto, @CurrentAdmin() admin: any) {
    console.log('[DEBUG] ReportsController.getReports - admin from JWT:', {
      sub: admin.sub,
      userId: admin.userId,
      email: admin.email,
      role: admin.role,
      memberId: admin.memberId,
    });
    return this.adminService.getReports(dto);
  }

  @Get(':reportId')
  @ApiOperation({
    summary: 'Xem chi tiết 1 báo cáo',
    description:
      'Xem thông tin đầy đủ của 1 report, bao gồm: người báo cáo, đối tượng bị báo cáo, lý do, bằng chứng, và lịch sử trạng thái.',
  })
  @ApiResponse({ status: 200, description: 'Chi tiết report' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async getReportDetail(@Param('reportId') reportId: string) {
    return this.adminService.getReportDetail(reportId);
  }

  @Post(':reportId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Xử lý báo cáo (đã giải quyết)',
    description:
      'Xác nhận report vi phạm và đã xử lý (ví dụ: khóa user, xóa nội dung...). Cần cung cấp hành động đã thực hiện.',
  })
  @ApiResponse({ status: 200, description: 'Resolve report thành công' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @CurrentAdmin() admin: any,
  ) {
    console.log('[DEBUG] ReportsController.resolveReport Called:', {
      reportId,
      dto,
      admin: {
        sub: admin.sub,
        userId: admin.userId,
        email: admin.email,
        role: admin.role,
        memberId: admin.memberId,
      },
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
    summary: 'Bác bỏ báo cáo (không vi phạm)',
    description:
      'Xác nhận report không vi phạm hoặc báo cáo sai. Cần cung cấp lý do.',
  })
  @ApiResponse({ status: 200, description: 'Bác bỏ report thành công' })
  @ApiResponse({ status: 404, description: 'Report không tồn tại' })
  async dismissReport(
    @Param('reportId') reportId: string,
    @Body() dto: DismissReportDto,
    @CurrentAdmin() admin: any,
  ) {
    console.log('[DEBUG] ReportsController.dismissReport Called:', {
      reportId,
      dto,
      admin: {
        sub: admin.sub,
        userId: admin.userId,
        email: admin.email,
        role: admin.role,
        memberId: admin.memberId,
      },
    });
    return this.adminService.dismissReport(
      reportId,
      dto,
      admin.sub,
      admin.email,
    );
  }
}
