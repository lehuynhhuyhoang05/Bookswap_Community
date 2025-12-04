// ============================================================
// src/modules/reports/reports.controller.ts
// Controller cho Reports (dành cho Members)
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
  Req,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FilesInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportsService } from './reports.service';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryMyReportsDto } from './dto/query-reports.dto';
import { StorageService } from '../../common/services/storage.service';

@ApiTags('Reports')
@ApiBearerAuth()
@Controller('reports')
@UseGuards(JwtAuthGuard)
export class ReportsController {
  constructor(
    private readonly reportsService: ReportsService,
    private readonly storageService: StorageService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Tạo report vi phạm (member only)' })
  @ApiResponse({ 
    status: 201, 
    description: 'Report submitted successfully',
    schema: {
      example: {
        report_id: 'report-uuid-123',
        status: 'PENDING',
        message: 'Report submitted successfully. Our team will review it soon.',
        created_at: '2025-11-05T14:30:00.000Z'
      }
    }
  })
  @ApiResponse({ status: 400, description: 'Invalid data or cannot report yourself' })
  @ApiResponse({ status: 404, description: 'Reporter or reported member not found' })
  async createReport(@Body() dto: CreateReportDto, @Req() req: any) {
    const reporterMemberId = req.user.memberId;
    if (!reporterMemberId) {
      throw new Error('Member ID not found in JWT payload');
    }
    return this.reportsService.createReport(reporterMemberId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lấy danh sách reports của mình' })
  @ApiResponse({ 
    status: 200, 
    description: 'List of reports created by current user',
  })
  async getMyReports(@Query() dto: QueryMyReportsDto, @Req() req: any) {
    const reporterMemberId = req.user.memberId;
    if (!reporterMemberId) {
      throw new Error('Member ID not found in JWT payload');
    }
    return this.reportsService.getMyReports(reporterMemberId, dto);
  }

  @Get(':reportId')
  @ApiOperation({ summary: 'Xem chi tiết 1 report của mình' })
  @ApiResponse({ status: 200, description: 'Report detail' })
  @ApiResponse({ status: 404, description: 'Report not found or no permission' })
  async getReportDetail(@Param('reportId') reportId: string, @Req() req: any) {
    const reporterMemberId = req.user.memberId;
    if (!reporterMemberId) {
      throw new Error('Member ID not found in JWT payload');
    }
    return this.reportsService.getReportDetail(reportId, reporterMemberId);
  }

  @Post('upload-evidence')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FilesInterceptor('files', 5)) // Max 5 files
  @ApiOperation({ summary: 'Upload evidence files for report' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        files: {
          type: 'array',
          items: {
            type: 'string',
            format: 'binary',
          },
        },
      },
    },
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Files uploaded successfully',
    schema: {
      example: {
        urls: ['/uploads/reports/uuid1.jpg', '/uploads/reports/uuid2.png'],
        message: 'Files uploaded successfully'
      }
    }
  })
  async uploadEvidence(@UploadedFiles() files: Express.Multer.File[]) {
    if (!files || files.length === 0) {
      return { urls: [], message: 'No files uploaded' };
    }

    const urls: string[] = [];
    for (const file of files) {
      // Upload to reports subfolder
      const url = await this.storageService.uploadFile(file, 'reports');
      urls.push(url);
    }

    return {
      urls,
      message: `${urls.length} file(s) uploaded successfully`,
    };
  }
}
