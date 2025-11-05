// ============================================================
// src/modules/admin/services/admin.service.ts
// Service xử lý tất cả logic của Admin System
// ============================================================
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Not, LessThan } from 'typeorm';
import { User, AccountStatus, UserRole } from '../../../infrastructure/database/entities/user.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Book, BookStatus } from '../../../infrastructure/database/entities/book.entity';
import { Review } from '../../../infrastructure/database/entities/review.entity';
import { Exchange, ExchangeStatus } from '../../../infrastructure/database/entities/exchange.entity';
import { ViolationReport, ReportStatus, ReportPriority } from '../../../infrastructure/database/entities/violation-report.entity';
import { AuditLog, AuditAction } from '../../../infrastructure/database/entities/audit-log.entity';
import {
  QueryUsersDto,
  LockUserDto,
  UnlockUserDto,
  DeleteUserDto,
  UpdateUserRoleDto,
} from '../dto/user-management.dto';
import { QueryBooksDto, RemoveBookDto, QueryReviewsDto, RemoveReviewDto } from '../dto/content-moderation.dto';
import { QueryReportsDto, ResolveReportDto, DismissReportDto } from '../dto/report-management.dto';

@Injectable()
export class AdminService {
  private readonly logger = new Logger(AdminService.name);

  constructor(
    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(Book)
    private bookRepo: Repository<Book>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(Exchange)
    private exchangeRepo: Repository<Exchange>,
    @InjectRepository(ViolationReport)
    private reportRepo: Repository<ViolationReport>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
  ) {}

  // ============================================================
  // USER MANAGEMENT
  // ============================================================

  /**
   * Lấy danh sách users với filter và pagination
   */
  async getUsers(dto: QueryUsersDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    
    const qb = this.userRepo
      .createQueryBuilder('u')
      .leftJoinAndSelect('u.member', 'm')
      .select([
        'u.user_id',
        'u.email',
        'u.full_name',
        'u.role',
        'u.account_status',
        'u.created_at',
        'u.last_login_at',
        'm.member_id',
        'm.trust_score',
      ])
      .skip((page - 1) * limit)
      .take(limit);

    // Filter theo role
    if (dto.role) {
      qb.andWhere('u.role = :role', { role: dto.role });
    }

    // Filter theo status
    if (dto.status) {
      qb.andWhere('u.account_status = :status', { status: dto.status });
    }

    // Search theo email hoặc full_name
    if (dto.search) {
      qb.andWhere('(u.email LIKE :search OR u.full_name LIKE :search)', {
        search: `%${dto.search}%`,
      });
    }

    // Sort
    qb.orderBy(`u.${dto.sortBy}`, dto.sortOrder);

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xem chi tiết 1 user
   */
  async getUserDetail(userId: string) {
    const user = await this.userRepo.findOne({
      where: { user_id: userId },
      relations: ['member'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Lấy thêm stats nếu là member
    let stats: {
      total_exchanges: number;
      total_books: number;
      trust_score: any;
      average_rating: any;
    } | null = null;
    
    if (user.member) {
      const exchangeCount = await this.exchangeRepo.count({
        where: [
          { member_a_id: user.member.member_id, status: ExchangeStatus.COMPLETED },
          { member_b_id: user.member.member_id, status: ExchangeStatus.COMPLETED },
        ],
      });

      const bookCount = await this.bookRepo.count({
        where: { owner_id: user.member.member_id, status: Not(BookStatus.REMOVED) },
      });

      stats = {
        total_exchanges: exchangeCount,
        total_books: bookCount,
        trust_score: user.member.trust_score,
        average_rating: user.member.average_rating,
      };
    }

    return {
      ...user,
      stats,
    };
  }

  /**
   * Khóa tài khoản user
   */
  async lockUser(userId: string, dto: LockUserDto, adminId: string, adminEmail: string) {
    // Không thể lock chính mình
    if (userId === adminId) {
      throw new BadRequestException('Cannot lock your own account');
    }

    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account_status === AccountStatus.LOCKED) {
      throw new BadRequestException('User is already locked');
    }

    // Update status
    const oldStatus = user.account_status;
    user.account_status = AccountStatus.LOCKED;
    await this.userRepo.save(user);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.LOCK_USER,
      entity_type: 'USER',
      entity_id: userId,
      old_value: { status: oldStatus },
      new_value: { status: AccountStatus.LOCKED },
      reason: dto.reason,
    });

    this.logger.log(`Admin ${adminEmail} locked user ${user.email}`);

    return { success: true, message: 'User locked successfully' };
  }

  /**
   * Mở khóa tài khoản user
   */
  async unlockUser(userId: string, dto: UnlockUserDto, adminId: string, adminEmail: string) {
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    if (user.account_status !== AccountStatus.LOCKED) {
      throw new BadRequestException('User is not locked');
    }

    // Update status
    user.account_status = AccountStatus.ACTIVE;
    await this.userRepo.save(user);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.UNLOCK_USER,
      entity_type: 'USER',
      entity_id: userId,
      old_value: { status: AccountStatus.LOCKED },
      new_value: { status: AccountStatus.ACTIVE },
      reason: dto.reason || 'Unlocked by admin',
    });

    this.logger.log(`Admin ${adminEmail} unlocked user ${user.email}`);

    return { success: true, message: 'User unlocked successfully' };
  }

  /**
   * Xóa user (soft delete)
   */
  async deleteUser(userId: string, dto: DeleteUserDto, adminId: string, adminEmail: string) {
    // Không thể xóa chính mình
    if (userId === adminId) {
      throw new BadRequestException('Cannot delete your own account');
    }

    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Soft delete: set status = DELETED
    const oldStatus = user.account_status;
    user.account_status = AccountStatus.DELETED;
    await this.userRepo.save(user);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.DELETE_USER,
      entity_type: 'USER',
      entity_id: userId,
      old_value: { status: oldStatus },
      new_value: { status: AccountStatus.DELETED },
      reason: dto.reason,
    });

    this.logger.warn(`Admin ${adminEmail} deleted user ${user.email}`);

    return { success: true, message: 'User deleted successfully' };
  }

  /**
   * Thay đổi role của user
   */
  async updateUserRole(userId: string, dto: UpdateUserRoleDto, adminId: string, adminEmail: string) {
    // Không thể thay đổi role của chính mình
    if (userId === adminId) {
      throw new BadRequestException('Cannot change your own role');
    }

    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldRole = user.role;
    user.role = dto.role;
    await this.userRepo.save(user);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.UPDATE_ROLE,
      entity_type: 'USER',
      entity_id: userId,
      old_value: { role: oldRole },
      new_value: { role: dto.role },
      reason: dto.reason || `Role changed to ${dto.role}`,
    });

    this.logger.log(`Admin ${adminEmail} changed user ${user.email} role from ${oldRole} to ${dto.role}`);

    return { success: true, message: 'User role updated successfully' };
  }

  // ============================================================
  // CONTENT MODERATION
  // ============================================================

  /**
   * Lấy danh sách books với filter
   */
  async getBooks(dto: QueryBooksDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    
    const qb = this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.owner', 'owner')
      .leftJoin('owner.user', 'u')
      .addSelect(['u.email', 'u.full_name'])
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.status) {
      qb.andWhere('b.status = :status', { status: dto.status });
    }

    if (dto.search) {
      qb.andWhere('(b.title LIKE :search OR b.author LIKE :search)', {
        search: `%${dto.search}%`,
      });
    }

    // TODO: Filter books bị reported (cần join với violation_reports)
    if (dto.reported) {
      // Tạm thời bỏ qua, cần có relationship
    }

    qb.orderBy('b.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Xóa book (soft delete: set status = REMOVED)
   */
  async removeBook(bookId: string, dto: RemoveBookDto, adminId: string, adminEmail: string) {
    const book = await this.bookRepo.findOne({ where: { book_id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    const oldStatus = book.status;
    book.status = BookStatus.REMOVED;
    await this.bookRepo.save(book);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.REMOVE_BOOK,
      entity_type: 'BOOK',
      entity_id: bookId,
      old_value: { status: oldStatus },
      new_value: { status: BookStatus.REMOVED },
      reason: dto.reason,
    });

    this.logger.log(`Admin ${adminEmail} removed book ${book.title}`);

    return { success: true, message: 'Book removed successfully' };
  }

  /**
   * Lấy danh sách reviews
   */
  async getReviews(dto: QueryReviewsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    
    const qb = this.reviewRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reviewer', 'reviewer')
      .leftJoinAndSelect('r.reviewee', 'reviewee')
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.rating) {
      qb.andWhere('r.rating = :rating', { rating: dto.rating });
    }

    qb.orderBy('r.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Xóa review (hard delete hoặc soft delete tùy business logic)
   */
  async removeReview(reviewId: string, dto: RemoveReviewDto, adminId: string, adminEmail: string) {
    const review = await this.reviewRepo.findOne({ where: { review_id: reviewId } });
    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Hard delete
    await this.reviewRepo.remove(review);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.REMOVE_REVIEW,
      entity_type: 'REVIEW',
      entity_id: reviewId,
      old_value: { review },
      new_value: null,
      reason: dto.reason,
    });

    this.logger.log(`Admin ${adminEmail} removed review ${reviewId}`);

    return { success: true, message: 'Review removed successfully' };
  }

  // ============================================================
  // REPORT SYSTEM
  // ============================================================

  /**
   * Lấy danh sách reports
   */
  async getReports(dto: QueryReportsDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;
    
    const qb = this.reportRepo
      .createQueryBuilder('r')
      .leftJoinAndSelect('r.reporter', 'reporter')
      .leftJoin('reporter.user', 'u')
      .addSelect(['u.email', 'u.full_name'])
      .skip((page - 1) * limit)
      .take(limit);

    if (dto.status) {
      qb.andWhere('r.status = :status', { status: dto.status });
    }

    if (dto.priority) {
      qb.andWhere('r.priority = :priority', { priority: dto.priority });
    }

    if (dto.type) {
      qb.andWhere('r.report_type = :type', { type: dto.type });
    }

    if (dto.reportedBy) {
      qb.andWhere('reporter.member_id = :memberId', { memberId: dto.reportedBy });
    }

    qb.orderBy('r.priority', 'DESC').addOrderBy('r.created_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    return {
      items,
      total,
      page,
      limit,
    };
  }

  /**
   * Xem chi tiết 1 report
   */
  async getReportDetail(reportId: string) {
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
      relations: ['reporter', 'reporter.user'],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Resolve report (đã xử lý)
   */
  async resolveReport(reportId: string, dto: ResolveReportDto, adminId: string, adminEmail: string) {
    const report = await this.reportRepo.findOne({ where: { report_id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.RESOLVED;
    report.resolution = dto.resolution;
    report.action_taken = dto.action_taken;
    report.resolved_at = new Date();
    report.assigned_to = adminId;

    await this.reportRepo.save(report);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.RESOLVE_REPORT,
      entity_type: 'REPORT',
      entity_id: reportId,
      old_value: { status: ReportStatus.PENDING },
      new_value: { status: ReportStatus.RESOLVED, resolution: dto.resolution },
      reason: dto.action_taken,
    });

    this.logger.log(`Admin ${adminEmail} resolved report ${reportId}`);

    return { success: true, message: 'Report resolved successfully' };
  }

  /**
   * Dismiss report (không vi phạm)
   */
  async dismissReport(reportId: string, dto: DismissReportDto, adminId: string, adminEmail: string) {
    const report = await this.reportRepo.findOne({ where: { report_id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    report.status = ReportStatus.DISMISSED;
    report.resolution = dto.reason;
    report.resolved_at = new Date();
    report.assigned_to = adminId;

    await this.reportRepo.save(report);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.DISMISS_REPORT,
      entity_type: 'REPORT',
      entity_id: reportId,
      old_value: { status: report.status },
      new_value: { status: ReportStatus.DISMISSED },
      reason: dto.reason,
    });

    this.logger.log(`Admin ${adminEmail} dismissed report ${reportId}`);

    return { success: true, message: 'Report dismissed successfully' };
  }

  // ============================================================
  // STATISTICS
  // ============================================================

  /**
   * Dashboard statistics
   */
  async getDashboardStats() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // User stats
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { account_status: AccountStatus.ACTIVE } });
    const lockedUsers = await this.userRepo.count({ where: { account_status: AccountStatus.LOCKED } });
    const newUsersToday = await this.userRepo.count({
      where: { created_at: Not(LessThan(today)) },
    });

    // Book stats
    const totalBooks = await this.bookRepo.count();
    const availableBooks = await this.bookRepo.count({ where: { status: BookStatus.AVAILABLE } });
    const exchangingBooks = await this.bookRepo.count({ where: { status: BookStatus.EXCHANGING } });
    const removedBooks = await this.bookRepo.count({ where: { status: BookStatus.REMOVED } });

    // Exchange stats
    const totalExchanges = await this.exchangeRepo.count();
    const completedExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.COMPLETED } });
    const pendingExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.PENDING } });
    const successRate = totalExchanges > 0 ? (completedExchanges / totalExchanges) * 100 : 0;

    // Report stats
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: ReportStatus.PENDING } });
    const resolvedReports = await this.reportRepo.count({ where: { status: ReportStatus.RESOLVED } });

    // Tính avg resolution time (giờ)
    const resolvedWithTime = await this.reportRepo
      .createQueryBuilder('r')
      .select('AVG(TIMESTAMPDIFF(HOUR, r.created_at, r.resolved_at))', 'avg_time')
      .where('r.status = :status', { status: ReportStatus.RESOLVED })
      .andWhere('r.resolved_at IS NOT NULL')
      .getRawOne();

    const avgResolutionTime = parseFloat(resolvedWithTime?.avg_time || '0') || 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
        new_today: newUsersToday,
      },
      books: {
        total: totalBooks,
        available: availableBooks,
        exchanging: exchangingBooks,
        removed: removedBooks,
      },
      exchanges: {
        total: totalExchanges,
        completed: completedExchanges,
        pending: pendingExchanges,
        success_rate: parseFloat(successRate.toFixed(2)),
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        avg_resolution_time: parseFloat(avgResolutionTime.toFixed(2)),
      },
    };
  }

  // ============================================================
  // HELPER: Create Audit Log
  // ============================================================
  private async createAuditLog(data: {
    admin_id: string;
    admin_email: string;
    action: AuditAction;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
    reason?: string;
  }) {
    const log = this.auditRepo.create({
      ...data,
      ip_address: 'N/A', // TODO: Lấy từ request
    });
    await this.auditRepo.save(log);
  }
}
