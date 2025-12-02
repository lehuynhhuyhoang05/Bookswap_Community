// ============================================================
// src/modules/admin/services/admin.service.ts
// Service xử lý tất cả logic của Admin System
// ============================================================
import {
  BadRequestException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, MoreThanOrEqual, Not, Repository } from 'typeorm';
import { ActivityLogService } from '../../../common/services/activity-log.service';
import { Admin } from '../../../infrastructure/database/entities/admin.entity';
import {
  AuditAction,
  AuditLog,
} from '../../../infrastructure/database/entities/audit-log.entity';
import {
  Book,
  BookStatus,
} from '../../../infrastructure/database/entities/book.entity';
import { Conversation } from '../../../infrastructure/database/entities/conversation.entity';
import {
  Exchange,
  ExchangeStatus,
} from '../../../infrastructure/database/entities/exchange.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Message } from '../../../infrastructure/database/entities/message.entity';
import { Review } from '../../../infrastructure/database/entities/review.entity';
import {
  AccountStatus,
  User,
} from '../../../infrastructure/database/entities/user.entity';
import {
  ReportStatus,
  ViolationReport,
} from '../../../infrastructure/database/entities/violation-report.entity';
import {
  QueryBooksDto,
  QueryReviewsDto,
  RemoveBookDto,
  RemoveReviewDto,
} from '../dto/content-moderation.dto';
import {
  CancelExchangeDto,
  QueryExchangesDto,
} from '../dto/exchange-management.dto';
import {
  QueryMessagesDto,
  RemoveMessageDto,
} from '../dto/messaging-moderation.dto';
import {
  DismissReportDto,
  QueryReportsDto,
  ResolveReportDto,
} from '../dto/report-management.dto';
import {
  DeleteUserDto,
  LockUserDto,
  QueryUsersDto,
  UnlockUserDto,
  UpdateUserRoleDto,
} from '../dto/user-management.dto';

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
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(Admin)
    private adminRepo: Repository<Admin>,
    private activityLogService: ActivityLogService,
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
          {
            member_a_id: user.member.member_id,
            status: ExchangeStatus.COMPLETED,
          },
          {
            member_b_id: user.member.member_id,
            status: ExchangeStatus.COMPLETED,
          },
        ],
      });

      const bookCount = await this.bookRepo.count({
        where: {
          owner_id: user.member.member_id,
          status: Not(BookStatus.REMOVED),
        },
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
  async lockUser(
    userId: string,
    dto: LockUserDto,
    adminId: string,
    adminEmail: string,
  ) {
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
  async unlockUser(
    userId: string,
    dto: UnlockUserDto,
    adminId: string,
    adminEmail: string,
  ) {
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
  async deleteUser(
    userId: string,
    dto: DeleteUserDto,
    adminId: string,
    adminEmail: string,
  ) {
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
  async updateUserRole(
    userId: string,
    dto: UpdateUserRoleDto,
    adminId: string,
    adminEmail: string,
  ) {
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

    this.logger.log(
      `Admin ${adminEmail} changed user ${user.email} role from ${oldRole} to ${dto.role}`,
    );

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
  async removeBook(
    bookId: string,
    dto: RemoveBookDto,
    adminId: string,
    adminEmail: string,
  ) {
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
   * Xóa vĩnh viễn book (hard delete từ database)
   */
  async permanentDeleteBook(
    bookId: string,
    dto: RemoveBookDto,
    adminId: string,
    adminEmail: string,
  ) {
    const book = await this.bookRepo.findOne({ where: { book_id: bookId } });
    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Lưu thông tin book để audit log
    const bookInfo = {
      title: book.title,
      author: book.author,
      status: book.status,
    };

    // Hard delete - xóa hẳn khỏi database
    await this.bookRepo.remove(book);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: 'PERMANENT_DELETE_BOOK' as AuditAction,
      entity_type: 'BOOK',
      entity_id: bookId,
      old_value: bookInfo,
      new_value: { deleted: true },
      reason: dto.reason,
    });

    this.logger.log(
      `Admin ${adminEmail} permanently deleted book ${bookInfo.title}`,
    );

    return { success: true, message: 'Book permanently deleted' };
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
  async removeReview(
    reviewId: string,
    dto: RemoveReviewDto,
    adminId: string,
    adminEmail: string,
  ) {
    const review = await this.reviewRepo.findOne({
      where: { review_id: reviewId },
    });
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
      .leftJoinAndSelect('reporter.user', 'reporterUser')
      .leftJoinAndSelect('r.reportedMember', 'reportedMember')
      .leftJoinAndSelect('reportedMember.user', 'reportedUser')
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
      qb.andWhere('reporter.member_id = :memberId', {
        memberId: dto.reportedBy,
      });
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
      relations: [
        'reporter',
        'reporter.user',
        'reportedMember',
        'reportedMember.user',
      ],
    });

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return report;
  }

  /**
   * Resolve report (đã xử lý)
   */
  async resolveReport(
    reportId: string,
    dto: ResolveReportDto,
    userId: string,
    adminEmail: string,
  ) {
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Find admin record by user_id
    const admin = await this.adminRepo.findOne({
      where: { user_id: userId },
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const oldStatus = report.status;

    report.status = ReportStatus.RESOLVED;
    report.resolution = dto.resolution;
    // DB schema không có action_taken column
    report.resolved_at = new Date();
    report.resolved_by = admin.admin_id; // Use admin_id from admins table

    await this.reportRepo.save(report);

    // Log audit with correct old status
    await this.createAuditLog({
      admin_id: admin.admin_id,
      admin_email: adminEmail,
      action: AuditAction.RESOLVE_REPORT,
      entity_type: 'REPORT',
      entity_id: reportId,
      old_value: { status: oldStatus },
      new_value: { status: ReportStatus.RESOLVED, resolution: dto.resolution },
      reason: dto.resolution, // DB không có action_taken, dùng resolution làm reason
    });

    this.logger.log(`Admin ${adminEmail} resolved report ${reportId}`);

    return { success: true, message: 'Report resolved successfully' };
  }

  /**
   * Dismiss report (không vi phạm)
   */
  async dismissReport(
    reportId: string,
    dto: DismissReportDto,
    userId: string,
    adminEmail: string,
  ) {
    const report = await this.reportRepo.findOne({
      where: { report_id: reportId },
    });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Find admin record by user_id
    const admin = await this.adminRepo.findOne({
      where: { user_id: userId },
    });
    console.log('[DEBUG] AdminService.dismissReport - Looking up admin:', {
      userId,
      adminFound: !!admin,
      adminId: admin?.admin_id,
      adminLevel: admin?.admin_level,
    });
    if (!admin) {
      throw new NotFoundException('Admin not found');
    }

    const oldStatus = report.status;

    report.status = ReportStatus.DISMISSED;
    report.resolution = dto.reason;
    report.resolved_at = new Date();
    report.resolved_by = admin.admin_id; // Use admin_id from admins table

    await this.reportRepo.save(report);

    // Log audit with correct old status
    await this.createAuditLog({
      admin_id: admin.admin_id,
      admin_email: adminEmail,
      action: AuditAction.DISMISS_REPORT,
      entity_type: 'REPORT',
      entity_id: reportId,
      old_value: { status: oldStatus },
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
    const activeUsers = await this.userRepo.count({
      where: { account_status: AccountStatus.ACTIVE },
    });
    const lockedUsers = await this.userRepo.count({
      where: { account_status: AccountStatus.LOCKED },
    });
    const deletedUsers = await this.userRepo.count({
      where: { account_status: AccountStatus.DELETED },
    });
    const newUsersToday = await this.userRepo.count({
      where: { created_at: Not(LessThan(today)) },
    });

    // Book stats
    const totalBooks = await this.bookRepo.count();
    const availableBooks = await this.bookRepo.count({
      where: { status: BookStatus.AVAILABLE },
    });
    const exchangingBooks = await this.bookRepo.count({
      where: { status: BookStatus.EXCHANGING },
    });
    const removedBooks = await this.bookRepo.count({
      where: { status: BookStatus.REMOVED },
    });

    // Exchange stats
    const totalExchanges = await this.exchangeRepo.count();
    const completedExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.COMPLETED },
    });
    const pendingExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.PENDING },
    });
    const successRate =
      totalExchanges > 0 ? (completedExchanges / totalExchanges) * 100 : 0;

    // Report stats
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({
      where: { status: ReportStatus.PENDING },
    });
    const resolvedReports = await this.reportRepo.count({
      where: { status: ReportStatus.RESOLVED },
    });

    // Tính avg resolution time (giờ)
    const resolvedWithTime = await this.reportRepo
      .createQueryBuilder('r')
      .select(
        'AVG(TIMESTAMPDIFF(HOUR, r.created_at, r.resolved_at))',
        'avg_time',
      )
      .where('r.status = :status', { status: ReportStatus.RESOLVED })
      .andWhere('r.resolved_at IS NOT NULL')
      .getRawOne();

    const avgResolutionTime =
      parseFloat(resolvedWithTime?.avg_time || '0') || 0;

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
        deleted: deletedUsers,
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
  // EXCHANGE MANAGEMENT
  // ============================================================

  /**
   * Lấy danh sách exchanges với filter và pagination
   */
  async getExchanges(dto: QueryExchangesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    const qb = this.exchangeRepo
      .createQueryBuilder('e')
      .leftJoinAndSelect('e.member_a', 'member_a')
      .leftJoinAndSelect('e.member_b', 'member_b')
      .leftJoin('member_a.user', 'user_a')
      .leftJoin('member_b.user', 'user_b')
      .addSelect(['user_a.email', 'user_a.full_name'])
      .addSelect(['user_b.email', 'user_b.full_name'])
      .skip((page - 1) * limit)
      .take(limit);

    // Filter theo status
    if (dto.status) {
      qb.andWhere('e.status = :status', { status: dto.status });
    }

    // Filter theo member_a_id
    if (dto.memberAId) {
      qb.andWhere('e.member_a_id = :memberAId', { memberAId: dto.memberAId });
    }

    // Filter theo member_b_id
    if (dto.memberBId) {
      qb.andWhere('e.member_b_id = :memberBId', { memberBId: dto.memberBId });
    }

    // Filter theo date range
    if (dto.startDate) {
      qb.andWhere('e.created_at >= :startDate', { startDate: dto.startDate });
    }

    if (dto.endDate) {
      qb.andWhere('e.created_at <= :endDate', { endDate: dto.endDate });
    }

    // Sort
    qb.orderBy(`e.${dto.sortBy}`, dto.sortOrder);

    const [items, total] = await qb.getManyAndCount();

    // Transform data để thêm tên members
    const transformedItems = items.map((item) => ({
      ...item,
      memberA_name:
        item.member_a?.user?.full_name ||
        item.member_a?.user?.email ||
        'Unknown',
      memberA_email: item.member_a?.user?.email || '',
      memberB_name:
        item.member_b?.user?.full_name ||
        item.member_b?.user?.email ||
        'Unknown',
      memberB_email: item.member_b?.user?.email || '',
    }));

    return {
      items: transformedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xem chi tiết 1 exchange
   */
  async getExchangeDetail(exchangeId: string) {
    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
      relations: [
        'member_a',
        'member_b',
        'member_a.user',
        'member_b.user',
        'request',
        'exchange_books',
        'exchange_books.book',
      ],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    return exchange;
  }

  /**
   * Cancel exchange (admin force cancel)
   */
  async cancelExchange(
    exchangeId: string,
    dto: CancelExchangeDto,
    adminId: string,
    adminEmail: string,
  ) {
    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
      relations: ['member_a', 'member_b'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.status === ExchangeStatus.CANCELLED) {
      throw new BadRequestException('Exchange is already cancelled');
    }

    if (exchange.status === ExchangeStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed exchange');
    }

    // Update status
    const oldStatus = exchange.status;
    exchange.status = ExchangeStatus.CANCELLED;
    await this.exchangeRepo.save(exchange);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.CANCEL_EXCHANGE,
      entity_type: 'EXCHANGE',
      entity_id: exchangeId,
      old_value: { status: oldStatus },
      new_value: { status: ExchangeStatus.CANCELLED },
      reason: dto.reason,
    });

    this.logger.warn(
      `Admin ${adminEmail} cancelled exchange ${exchangeId}: ${dto.reason}`,
    );

    return { success: true, message: 'Exchange cancelled successfully' };
  }

  /**
   * Thống kê exchanges cho admin
   */
  async getExchangeStats() {
    const totalExchanges = await this.exchangeRepo.count();
    const completedExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.COMPLETED },
    });
    const pendingExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.PENDING },
    });
    const acceptedExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.ACCEPTED },
    });
    const cancelledExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.CANCELLED },
    });

    // Tính tỷ lệ thành công
    const successRate =
      totalExchanges > 0 ? (completedExchanges / totalExchanges) * 100 : 0;

    // Tính avg time to complete (giờ)
    const avgTimeResult = await this.exchangeRepo
      .createQueryBuilder('e')
      .select(
        'AVG(TIMESTAMPDIFF(HOUR, e.created_at, e.completed_at))',
        'avg_hours',
      )
      .where('e.status = :status', { status: ExchangeStatus.COMPLETED })
      .andWhere('e.completed_at IS NOT NULL')
      .getRawOne();

    const avgCompletionTime = parseFloat(avgTimeResult?.avg_hours || '0') || 0;

    // Top 10 members theo số lượng exchanges hoàn thành
    const topMembers = await this.exchangeRepo
      .createQueryBuilder('e')
      .select('m.member_id', 'member_id')
      .addSelect('u.full_name', 'full_name')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(*)', 'exchange_count')
      .innerJoin(
        'members',
        'm',
        '(e.member_a_id = m.member_id OR e.member_b_id = m.member_id)',
      )
      .innerJoin('users', 'u', 'u.user_id = m.user_id')
      .where('e.status = :status', { status: ExchangeStatus.COMPLETED })
      .groupBy('m.member_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.email')
      .orderBy('exchange_count', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      overview: {
        total: totalExchanges,
        completed: completedExchanges,
        pending: pendingExchanges,
        accepted: acceptedExchanges,
        cancelled: cancelledExchanges,
        success_rate: parseFloat(successRate.toFixed(2)),
        avg_completion_hours: parseFloat(avgCompletionTime.toFixed(2)),
      },
      top_members: topMembers,
    };
  }

  // ============================================================
  // MESSAGING MODERATION
  // ============================================================

  /**
   * Lấy danh sách messages (admin có thể xem tất cả)
   */
  async getMessages(dto: QueryMessagesDto) {
    const page = dto.page ?? 1;
    const limit = dto.limit ?? 20;

    console.log('[DEBUG] getMessages called with dto:', dto);

    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.sender', 'sender')
      .leftJoinAndSelect('m.receiver', 'receiver')
      .leftJoinAndSelect('m.conversation', 'conv')
      .leftJoin('sender.user', 'sender_user')
      .leftJoin('receiver.user', 'receiver_user')
      .addSelect(['sender_user.email', 'sender_user.full_name'])
      .addSelect(['receiver_user.email', 'receiver_user.full_name'])
      .skip((page - 1) * limit)
      .take(limit);

    // Filter theo conversation
    if (dto.conversationId) {
      qb.andWhere('m.conversation_id = :conversationId', {
        conversationId: dto.conversationId,
      });
    }

    // Filter theo sender
    if (dto.senderId) {
      qb.andWhere('m.sender_id = :senderId', { senderId: dto.senderId });
    }

    // Filter theo deleted status
    if (dto.deletedOnly === true) {
      qb.andWhere('m.deleted_at IS NOT NULL');
    } else if (dto.deletedOnly === false) {
      qb.andWhere('m.deleted_at IS NULL');
    }
    // Nếu deletedOnly không được chỉ định, hiển thị tất cả messages (cả deleted và chưa deleted)

    // Search trong content
    if (dto.search) {
      qb.andWhere('m.content LIKE :search', { search: `%${dto.search}%` });
    }

    qb.orderBy('m.sent_at', 'DESC');

    const [items, total] = await qb.getManyAndCount();

    // Transform data để thêm thông tin về deleted status và sender name
    const transformedItems = items.map((item) => ({
      ...item,
      deleted: !!item.deleted_at,
      sender_name:
        item.sender?.user?.full_name || item.sender?.user?.email || 'Unknown',
    }));

    return {
      items: transformedItems,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Xem chi tiết conversation (admin view)
   */
  async getConversationDetail(conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: conversationId },
      relations: [
        'member_a',
        'member_b',
        'member_a.user',
        'member_b.user',
        'exchange_request',
      ],
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    // Lấy messages trong conversation (bao gồm cả deleted)
    const messages = await this.messageRepo.find({
      where: { conversation_id: conversationId },
      relations: ['sender', 'receiver'],
      order: { sent_at: 'ASC' },
    });

    return {
      ...conversation,
      messages,
      total_messages_including_deleted: messages.length,
    };
  }

  /**
   * Xóa message (soft delete)
   */
  async removeMessage(
    messageId: string,
    dto: RemoveMessageDto,
    adminId: string,
    adminEmail: string,
  ) {
    const message = await this.messageRepo.findOne({
      where: { message_id: messageId },
      relations: ['sender', 'receiver'],
    });

    if (!message) {
      throw new NotFoundException('Message not found');
    }

    if (message.deleted_at) {
      throw new BadRequestException('Message is already deleted');
    }

    // Soft delete: set deleted_at
    message.deleted_at = new Date();
    await this.messageRepo.save(message);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.REMOVE_MESSAGE,
      entity_type: 'MESSAGE',
      entity_id: messageId,
      old_value: { content: message.content, deleted_at: null },
      new_value: { deleted_at: message.deleted_at },
      reason: dto.reason,
    });

    this.logger.warn(
      `Admin ${adminEmail} removed message ${messageId}: ${dto.reason}`,
    );

    return { success: true, message: 'Message removed successfully' };
  }

  // ============================================================
  // USER ACTIVITY TRACKING (Admin View)
  // ============================================================

  /**
   * Xem activities của 1 user (admin only)
   */
  async getUserActivities(
    userId: string,
    options?: {
      page?: number;
      limit?: number;
      action?: string;
      startDate?: string;
      endDate?: string;
    },
  ) {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Parse dates if provided
    const parsedOptions = {
      ...options,
      startDate: options?.startDate ? new Date(options.startDate) : undefined,
      endDate: options?.endDate ? new Date(options.endDate) : undefined,
    };

    const activities = await this.activityLogService.getUserActivities(
      userId,
      parsedOptions,
    );

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
      },
      ...activities,
    };
  }

  /**
   * Thống kê activities của user
   */
  async getUserActivityStats(userId: string, days: number = 30) {
    // Verify user exists
    const user = await this.userRepo.findOne({ where: { user_id: userId } });
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const stats = await this.activityLogService.getUserActivityStats(
      userId,
      days,
    );

    return {
      user: {
        user_id: user.user_id,
        email: user.email,
        full_name: user.full_name,
      },
      ...stats,
    };
  }

  // ============================================================
  // EXCHANGE MANAGEMENT
  // ============================================================

  /**
   * Lấy danh sách exchanges với filter và pagination
   */
  async getExchanges(dto: QueryExchangesDto) {
    const {
      page = 1,
      limit = 20,
      status,
      memberAId,
      memberBId,
      startDate,
      endDate,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = dto;

    const query = this.exchangeRepo
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.member_a', 'memberA')
      .leftJoinAndSelect('memberA.user', 'userA')
      .leftJoinAndSelect('exchange.member_b', 'memberB')
      .leftJoinAndSelect('memberB.user', 'userB')
      .leftJoinAndSelect('exchange.request', 'request')
      .leftJoinAndSelect('exchange.exchange_books', 'exchange_books')
      .leftJoinAndSelect('exchange_books.book', 'book');

    // Filters
    if (status) {
      query.andWhere('exchange.status = :status', { status });
    }

    if (memberAId) {
      query.andWhere('exchange.member_a_id = :memberAId', { memberAId });
    }

    if (memberBId) {
      query.andWhere('exchange.member_b_id = :memberBId', { memberBId });
    }

    if (startDate) {
      query.andWhere('exchange.created_at >= :startDate', { startDate });
    }

    if (endDate) {
      query.andWhere('exchange.created_at <= :endDate', { endDate });
    }

    // Sorting
    const validSortFields = [
      'created_at',
      'updated_at',
      'status',
      'completed_at',
    ];
    const sortField = validSortFields.includes(sortBy) ? sortBy : 'created_at';
    const order = sortOrder.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';
    query.orderBy(`exchange.${sortField}`, order);

    // Pagination
    const offset = (page - 1) * limit;
    query.skip(offset).take(limit);

    const [exchanges, total] = await query.getManyAndCount();

    // Transform data to include member names and emails
    const transformedExchanges = exchanges.map((exchange) => ({
      ...exchange,
      memberA_name:
        exchange.member_a?.user?.full_name || exchange.member_a?.user?.email,
      memberA_email: exchange.member_a?.user?.email,
      memberB_name:
        exchange.member_b?.user?.full_name || exchange.member_b?.user?.email,
      memberB_email: exchange.member_b?.user?.email,
    }));

    return {
      items: transformedExchanges,
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lấy chi tiết 1 exchange
   */
  async getExchangeDetail(exchangeId: string) {
    const exchange = await this.exchangeRepo
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.member_a', 'memberA')
      .leftJoinAndSelect('memberA.user', 'userA')
      .leftJoinAndSelect('exchange.member_b', 'memberB')
      .leftJoinAndSelect('memberB.user', 'userB')
      .leftJoinAndSelect('exchange.request', 'request')
      .leftJoinAndSelect('exchange.exchange_books', 'exchange_books')
      .leftJoinAndSelect('exchange_books.book', 'book')
      .leftJoinAndSelect('exchange.reviews', 'reviews')
      .where('exchange.exchange_id = :exchangeId', { exchangeId })
      .getOne();

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Transform data to include member names and emails
    return {
      ...exchange,
      memberA_name:
        exchange.member_a?.user?.full_name || exchange.member_a?.user?.email,
      memberA_email: exchange.member_a?.user?.email,
      memberB_name:
        exchange.member_b?.user?.full_name || exchange.member_b?.user?.email,
      memberB_email: exchange.member_b?.user?.email,
    };
  }

  /**
   * Hủy exchange bởi admin
   */
  async cancelExchange(
    exchangeId: string,
    dto: CancelExchangeDto,
    adminId: string,
  ) {
    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
      relations: ['member_a', 'member_b', 'member_a.user', 'member_b.user'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    if (exchange.status === ExchangeStatus.CANCELLED) {
      throw new BadRequestException('Exchange already cancelled');
    }

    if (exchange.status === ExchangeStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel completed exchange');
    }

    // Update exchange
    exchange.status = ExchangeStatus.CANCELLED;
    exchange.cancellation_reason = 'ADMIN_CANCELLED';
    exchange.cancellation_details = dto.reason;
    exchange.updated_at = new Date();

    await this.exchangeRepo.save(exchange);

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: 'N/A',
      action: AuditAction.DELETE,
      entity_type: 'exchange',
      entity_id: exchangeId,
      old_value: 'status: ' + ExchangeStatus.PENDING,
      new_value:
        'status: ' + ExchangeStatus.CANCELLED + ', reason: ' + dto.reason,
    });

    return {
      message: 'Exchange cancelled successfully',
      exchange,
    };
  }

  /**
   * Thống kê tổng quan về exchanges
   */
  async getExchangeStatistics() {
    // Count by status
    const statusCounts = await this.exchangeRepo
      .createQueryBuilder('exchange')
      .select('exchange.status', 'status')
      .addSelect('COUNT(*)', 'count')
      .groupBy('exchange.status')
      .getRawMany();

    // Total exchanges
    const totalExchanges = await this.exchangeRepo.count();

    // Completed exchanges
    const completedExchanges = await this.exchangeRepo.count({
      where: { status: ExchangeStatus.COMPLETED },
    });

    // Success rate
    const successRate =
      totalExchanges > 0 ? (completedExchanges / totalExchanges) * 100 : 0;

    // Recent exchanges (last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const recentExchanges = await this.exchangeRepo.count({
      where: {
        created_at: MoreThanOrEqual(sevenDaysAgo),
      },
    });
    return {
      totalExchanges,
      completedExchanges,
      successRate: Number(successRate.toFixed(2)),
      recentExchanges,
      statusBreakdown: statusCounts.reduce((acc, curr) => {
        acc[curr.status] = Number(curr.count);
        return acc;
      }, {}),
    };
  }

  // ============================================================
  // HELPER: Create Audit Log
  // ============================================================
  private async createAuditLog(data: {
    admin_id: string;
    admin_email: string; // Giữ param để không phá vỡ call sites, nhưng không lưu vào DB
    action: AuditAction;
    entity_type: string;
    entity_id: string;
    old_value?: any;
    new_value?: any;
    reason?: string; // Giữ param nhưng không lưu vào DB
  }) {
    const log = this.auditRepo.create({
      admin_id: data.admin_id,
      action: data.action,
      entity_type: data.entity_type,
      entity_id: data.entity_id,
      old_value: data.old_value,
      new_value: data.new_value,
      ip_address: 'N/A', // TODO: Lấy từ request
      user_agent: undefined,
    });

    // Ghi audit nhưng không làm fail toàn bộ request nếu bảng chưa tồn tại.
    // Nếu migration chưa chạy, bắt lỗi và log cảnh báo để admin vẫn có thể thao tác.
    try {
      await this.auditRepo.save(log);
    } catch (err) {
      // Lưu lỗi nhưng không ném ra cao hơn (tránh 500 khi audit table chưa có)
      this.logger.warn(
        `Failed to write audit log (action=${data.action}, entity=${data.entity_type}/${data.entity_id}): ${err?.message || err}`,
      );
      this.logger.warn(
        'If this is unexpected run the DB migrations to create audit_logs table.',
      );
    }
  }
}
