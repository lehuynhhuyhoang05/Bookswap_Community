// ============================================================
// src/modules/admin/controllers/reports.controller.ts
// Controller riêng cho Report System (tách ra để dễ quản lý)
// ============================================================
import {
  Controller,
  Get,
  Post,
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
import { QueryReportsDto, ResolveReportDto, DismissReportDto } from '../dto/report-management.dto';

@ApiTags('Admin - Reports')
@ApiBearerAuth()
@Controller('admin/reports')
@UseGuards(JwtAuthGuard, AdminGuard)
@Admin()
export class ReportsController {
  constructor(private readonly adminService: AdminService) {}

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách reports' })
  @ApiResponse({ status: 200, description: 'Danh sách reports' })
  async getReports(@Query() dto: QueryReportsDto) {
    return this.adminService.getReports(dto);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Xem chi tiết 1 report' })
  @ApiResponse({ status: 200, description: 'Chi tiết report' })
  async getReportDetail(@Param('reportId') reportId: string) {
    return this.adminService.getReportDetail(reportId);
  }

  @Post(':reportId/resolve')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Resolve report (đã xử lý)' })
  @ApiResponse({ status: 200, description: 'Report đã được resolve' })
  async resolveReport(
    @Param('reportId') reportId: string,
    @Body() dto: ResolveReportDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.resolveReport(reportId, dto, admin.sub, admin.email);
  }

  @Post(':reportId/dismiss')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dismiss report (không vi phạm)' })
  @ApiResponse({ status: 200, description: 'Report đã được dismiss' })
  async dismissReport(
    @Param('reportId') reportId: string,
    @Body() dto: DismissReportDto,
    @CurrentAdmin() admin: any,
  ) {
    return this.adminService.dismissReport(reportId, dto, admin.sub, admin.email);
  }
}
