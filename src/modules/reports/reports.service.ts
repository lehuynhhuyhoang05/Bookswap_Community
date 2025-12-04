// ============================================================
// src/modules/reports/reports.service.ts
// Service xử lý reports từ users
// ============================================================
import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ViolationReport, ReportStatus, ReportPriority, ReportSeverity } from '../../infrastructure/database/entities/violation-report.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { CreateReportDto } from './dto/create-report.dto';
import { QueryMyReportsDto } from './dto/query-reports.dto';

@Injectable()
export class ReportsService {
  constructor(
    @InjectRepository(ViolationReport)
    private reportRepo: Repository<ViolationReport>,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
  ) {}

  /**
   * Tạo report mới từ member
   */
  async createReport(reporterMemberId: string, dto: CreateReportDto) {
    // Validate reporter tồn tại
    const reporter = await this.memberRepo.findOne({ 
      where: { member_id: reporterMemberId } 
    });
    if (!reporter) {
      throw new NotFoundException('Reporter member not found');
    }

    // Validate reported member tồn tại
    const reportedMember = await this.memberRepo.findOne({ 
      where: { member_id: dto.reported_member_id } 
    });
    if (!reportedMember) {
      throw new NotFoundException('Reported member not found');
    }

    // Không thể report chính mình
    if (reporterMemberId === dto.reported_member_id) {
      throw new BadRequestException('Cannot report yourself');
    }

    // Tạo report với priority mặc định dựa vào loại vi phạm hoặc severity
    const priority = dto.severity 
      ? this.severityToPriority(dto.severity)
      : this.calculatePriority(dto.report_type);

    const report = this.reportRepo.create();
    report.reporter_id = reporterMemberId;
    report.reported_member_id = dto.reported_member_id;
    report.report_type = dto.report_type;
    if (dto.reported_item_type) report.reported_item_type = dto.reported_item_type;
    if (dto.reported_item_id) report.reported_item_id = dto.reported_item_id;
    report.description = dto.description;
    report.status = ReportStatus.PENDING;
    report.priority = priority;
    
    // New fields: severity and evidence
    if (dto.severity) report.severity = dto.severity as unknown as ReportSeverity;
    if (dto.evidence_urls && dto.evidence_urls.length > 0) {
      report.evidence_urls = dto.evidence_urls;
    }

    await this.reportRepo.save(report);

    return {
      report_id: report.report_id,
      status: report.status,
      message: 'Report submitted successfully. Our team will review it soon.',
      created_at: report.created_at,
    };
  }

  /**
   * Lấy danh sách reports của member (reports mà mình đã tạo)
   */
  async getMyReports(reporterMemberId: string, dto: QueryMyReportsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const [items, total] = await this.reportRepo.findAndCount({
      where: { reporter_id: reporterMemberId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xem chi tiết 1 report (chỉ report của mình)
   */
  async getReportDetail(reportId: string, reporterMemberId: string) {
    const report = await this.reportRepo.findOne({
      where: { 
        report_id: reportId,
        reporter_id: reporterMemberId, // Chỉ xem được report của mình
      },
    });

    if (!report) {
      throw new NotFoundException('Report not found or you do not have permission to view it');
    }

    return report;
  }

  /**
   * Tính priority dựa vào loại vi phạm
   */
  private calculatePriority(reportType: string): ReportPriority {
    switch (reportType) {
      case 'HARASSMENT':
      case 'FRAUD':
        return ReportPriority.HIGH;
      case 'SPAM':
      case 'INAPPROPRIATE_CONTENT':
        return ReportPriority.MEDIUM;
      case 'FAKE_PROFILE':
      case 'OTHER':
      default:
        return ReportPriority.LOW;
    }
  }

  /**
   * Chuyển severity thành priority
   */
  private severityToPriority(severity: string): ReportPriority {
    switch (severity) {
      case 'HIGH':
        return ReportPriority.HIGH;
      case 'MEDIUM':
        return ReportPriority.MEDIUM;
      case 'LOW':
      default:
        return ReportPriority.LOW;
    }
  }
}
