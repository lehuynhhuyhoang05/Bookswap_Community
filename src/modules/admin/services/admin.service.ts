// ============================================================
// src/modules/admin/services/admin.service.ts
// Service xử lý tất cả logic của Admin System
// Updated: Fix admin cancel exchange bug & reported books filter
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
import { ExchangeBook } from '../../../infrastructure/database/entities/exchange-book.entity';
import { ViolationReport, ReportStatus, ReportPriority } from '../../../infrastructure/database/entities/violation-report.entity';
import { AuditLog, AuditAction } from '../../../infrastructure/database/entities/audit-log.entity';
import { Message } from '../../../infrastructure/database/entities/message.entity';
import { Conversation } from '../../../infrastructure/database/entities/conversation.entity';
import { ActivityLogService } from '../../../common/services/activity-log.service';
import { NotificationsService } from '../../notifications/services/notifications.service';
import {
  QueryUsersDto,
  LockUserDto,
  UnlockUserDto,
  DeleteUserDto,
  UpdateUserRoleDto,
  UpdateUserInfoDto,
} from '../dto/user-management.dto';
import { QueryBooksDto, RemoveBookDto, RestoreBookDto, BatchRemoveBooksDto, QueryReviewsDto, RemoveReviewDto } from '../dto/content-moderation.dto';
import { QueryReportsDto, ResolveReportDto, DismissReportDto } from '../dto/report-management.dto';
import { QueryExchangesDto, CancelExchangeDto } from '../dto/exchange-management.dto';
import { QueryMessagesDto, RemoveMessageDto } from '../dto/messaging-moderation.dto';
import { QuerySuspiciousActivitiesDto, SuspiciousActivityType } from '../dto/suspicious-activity.dto';
import { AdjustTrustScoreDto } from '../dto/trust-score-management.dto';
import { TrustScoreHistory, TrustScoreSource } from '../../../infrastructure/database/entities/trust-score-history.entity';

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
    @InjectRepository(ExchangeBook)
    private exchangeBookRepo: Repository<ExchangeBook>,
    @InjectRepository(ViolationReport)
    private reportRepo: Repository<ViolationReport>,
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    @InjectRepository(Message)
    private messageRepo: Repository<Message>,
    @InjectRepository(Conversation)
    private conversationRepo: Repository<Conversation>,
    @InjectRepository(TrustScoreHistory)
    private trustScoreHistoryRepo: Repository<TrustScoreHistory>,
    private activityLogService: ActivityLogService,
    private notificationsService: NotificationsService,
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
      total_reviews_received: number;
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

      const reviewCount = await this.reviewRepo.count({
        where: { reviewee_id: user.member.member_id },
      });

      stats = {
        total_exchanges: exchangeCount,
        total_books: bookCount,
        trust_score: user.member.trust_score,
        average_rating: user.member.average_rating,
        total_reviews_received: reviewCount,
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

  /**
   * Cập nhật thông tin user (admin edit)
   */
  async updateUserInfo(userId: string, dto: any, adminId: string, adminEmail: string) {
    const user = await this.userRepo.findOne({ 
      where: { user_id: userId },
      relations: ['member']
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const oldData: any = {};
    const newData: any = {};

    // Update user table fields
    if (dto.full_name !== undefined) {
      oldData.full_name = user.full_name;
      newData.full_name = dto.full_name;
      user.full_name = dto.full_name;
    }
    if (dto.email !== undefined) {
      oldData.email = user.email;
      newData.email = dto.email;
      user.email = dto.email;
    }

    await this.userRepo.save(user);

    // Update member table fields if user has member profile
    if (user.member) {
      if (dto.phone !== undefined) {
        oldData.phone = user.member.phone;
        newData.phone = dto.phone;
        user.member.phone = dto.phone;
      }
      if (dto.region !== undefined) {
        oldData.region = user.member.region;
        newData.region = dto.region;
        user.member.region = dto.region;
      }
      if (dto.bio !== undefined) {
        oldData.bio = user.member.bio;
        newData.bio = dto.bio;
        user.member.bio = dto.bio;
      }

      await this.memberRepo.save(user.member);
    }

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.UPDATE_USER,
      entity_type: 'USER',
      entity_id: userId,
      old_value: oldData,
      new_value: newData,
      reason: dto.reason || 'Admin updated user info',
    });

    this.logger.log(`Admin ${adminEmail} updated user ${user.email} info`);

    return { success: true, message: 'User info updated successfully' };
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

    // ✅ Simple query without complex joins first
    const qb = this.bookRepo
      .createQueryBuilder('b')
      .leftJoinAndSelect('b.owner', 'owner')
      .leftJoinAndSelect('owner.user', 'u');

    // Filters
    if (dto.status) {
      qb.andWhere('b.status = :status', { status: dto.status });
    }

    if (dto.search) {
      qb.andWhere('(b.title LIKE :search OR b.author LIKE :search OR b.isbn LIKE :search)', {
        search: `%${dto.search}%`,
      });
    }

    // ✅ Filter by reported books using subquery
    if (dto.reported) {
      qb.andWhere((qb) => {
        const subQuery = qb
          .subQuery()
          .select('1')
          .from('violation_reports', 'vr')
          .where('vr.reported_item_id = b.book_id')
          .andWhere('vr.reported_item_type = :itemType', { itemType: 'BOOK' })
          .andWhere('vr.status = :reportStatus', { reportStatus: ReportStatus.PENDING })
          .getQuery();
        return `EXISTS ${subQuery}`;
      });
    }

    // Get total count
    const total = await qb.getCount();

    this.logger.log(`[getBooks] Total books found: ${total}, Page: ${page}, Limit: ${limit}`);

    // Apply sorting
    qb.orderBy('b.created_at', 'DESC');

    // Apply pagination
    qb.skip((page - 1) * limit);
    qb.take(limit);

    const books = await qb.getMany();

    this.logger.log(`[getBooks] Books returned: ${books.length}`);

    // ✅ Get report counts for returned books in separate query
    const bookIds = books.map(b => b.book_id);
    let reportCounts: Record<string, number> = {};

    if (bookIds.length > 0) {
      const reportCountResults = await this.reportRepo
        .createQueryBuilder('vr')
        .select('vr.reported_item_id', 'book_id')
        .addSelect('COUNT(vr.report_id)', 'count')
        .where('vr.reported_item_type = :itemType', { itemType: 'BOOK' })
        .andWhere('vr.status = :reportStatus', { reportStatus: ReportStatus.PENDING })
        .andWhere('vr.reported_item_id IN (:...bookIds)', { bookIds })
        .groupBy('vr.reported_item_id')
        .getRawMany();

      reportCounts = reportCountResults.reduce((acc, row) => {
        acc[row.book_id] = parseInt(row.count) || 0;
        return acc;
      }, {} as Record<string, number>);
    }

    // ✅ Map books with report counts
    const items = books.map((book) => ({
      ...book,
      report_count: reportCounts[book.book_id] || 0,
    }));

    return {
      items,
      total,
      page,
      limit,
      has_next_page: page * limit < total,
      has_prev_page: page > 1,
    };
  }

  /**
   * Xóa book (soft delete: set status = REMOVED)
   */
  async removeBook(bookId: string, dto: RemoveBookDto, adminId: string, adminEmail: string) {
    // ✅ Load full book với owner và user
    const book = await this.bookRepo.findOne({
      where: { book_id: bookId },
      relations: ['owner', 'owner.user'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // ✅ Validate business logic
    if (book.status === BookStatus.EXCHANGING) {
      throw new BadRequestException(
        'Cannot remove book that is currently being exchanged. Please cancel the exchange first.'
      );
    }

    // Books with REMOVED status are soft deleted, no need to check EXCHANGED
    // since we only have AVAILABLE, EXCHANGING, REMOVED statuses

    const oldStatus = book.status;
    book.status = BookStatus.REMOVED;
    book.deleted_at = new Date();
    await this.bookRepo.save(book);

    // ✅ Send notification to owner
    try {
      await this.notificationsService.create(
        book.owner_id,
        'ADMIN_ACTION',
        {
          title: 'Sách của bạn đã bị gỡ bởi Admin',
          message: `Sách "${book.title}" đã bị gỡ khỏi hệ thống. Lý do: ${dto.reason}`,
          book_id: bookId,
          book_title: book.title,
          reason: dto.reason,
          admin_action: 'REMOVE_BOOK',
        }
      );
    } catch (error) {
      this.logger.warn(`Failed to send notification to owner: ${error.message}`);
      // Don't block the operation
    }

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.REMOVE_BOOK,
      entity_type: 'BOOK',
      entity_id: bookId,
      old_value: { status: oldStatus, title: book.title },
      new_value: { status: BookStatus.REMOVED },
      reason: dto.reason,
    });

    this.logger.log(
      `Admin ${adminEmail} removed book "${book.title}" (${bookId}). Owner: ${book.owner?.user?.email || 'unknown'}`
    );

    return {
      success: true,
      message: 'Book removed successfully',
      book: {
        book_id: book.book_id,
        title: book.title,
        owner_email: book.owner?.user?.email,
      },
    };
  }

  /**
   * Khôi phục book đã bị xóa
   */
  async restoreBook(bookId: string, dto: RestoreBookDto, adminId: string, adminEmail: string) {
    const book = await this.bookRepo.findOne({
      where: { book_id: bookId },
      relations: ['owner', 'owner.user'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    if (book.status !== BookStatus.REMOVED) {
      throw new BadRequestException(`Cannot restore book with status ${book.status}. Only REMOVED books can be restored.`);
    }

    const oldStatus = book.status;
    book.status = BookStatus.AVAILABLE;
    (book as any).deleted_at = null; // Clear deleted timestamp - cast to bypass TypeScript nullable check
    await this.bookRepo.save(book);

    // Send notification to owner
    try {
      await this.notificationsService.create(
        book.owner_id,
        'ADMIN_ACTION',
        {
          title: 'Sách của bạn đã được khôi phục',
          message: `Sách "${book.title}" đã được khôi phục bởi Admin. Lý do: ${dto.reason}`,
          book_id: bookId,
          book_title: book.title,
          reason: dto.reason,
          admin_action: 'RESTORE_BOOK',
        }
      );
    } catch (error) {
      this.logger.warn(`Failed to send notification to owner: ${error.message}`);
    }

    // Log audit
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.RESTORE_BOOK,
      entity_type: 'BOOK',
      entity_id: bookId,
      old_value: { status: oldStatus, deleted_at: book.deleted_at },
      new_value: { status: BookStatus.AVAILABLE, deleted_at: null },
      reason: dto.reason,
    });

    this.logger.log(
      `Admin ${adminEmail} restored book "${book.title}" (${bookId}). Owner: ${book.owner?.user?.email || 'unknown'}`
    );

    return {
      success: true,
      message: 'Book restored successfully',
      book: {
        book_id: book.book_id,
        title: book.title,
        status: book.status,
        owner_email: book.owner?.user?.email,
      },
    };
  }

  /**
   * Xóa hàng loạt books (batch operation)
   */
  async batchRemoveBooks(dto: BatchRemoveBooksDto, adminId: string, adminEmail: string) {
    if (dto.bookIds.length > 50) {
      throw new BadRequestException('Cannot remove more than 50 books at once');
    }

    const results = {
      total: dto.bookIds.length,
      success: 0,
      failed: 0,
      details: [] as any[],
    };

    for (const bookId of dto.bookIds) {
      try {
        await this.removeBook(bookId, { reason: dto.reason }, adminId, adminEmail);
        results.success++;
        results.details.push({
          book_id: bookId,
          status: 'success',
        });
      } catch (error) {
        results.failed++;
        results.details.push({
          book_id: bookId,
          status: 'failed',
          error: error.message,
        });
      }
    }

    this.logger.log(
      `Admin ${adminEmail} batch removed ${results.success}/${results.total} books. Failed: ${results.failed}`
    );

    return {
      success: true,
      message: `Batch remove completed. Success: ${results.success}/${results.total}`,
      results,
    };
  }

  /**
   * Lấy chi tiết book với thông tin đầy đủ (reports, exchange history)
   */
  async getBookDetail(bookId: string) {
    const book = await this.bookRepo.findOne({
      where: { book_id: bookId },
      relations: ['owner', 'owner.user'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // Get violation reports
    const reports = await this.reportRepo
      .createQueryBuilder('vr')
      .leftJoinAndSelect('vr.reporter', 'reporter')
      .leftJoinAndSelect('reporter.user', 'reporter_user')
      .where('vr.reported_item_type = :type', { type: 'BOOK' })
      .andWhere('vr.reported_item_id = :bookId', { bookId })
      .orderBy('vr.created_at', 'DESC')
      .getMany();

    // Get exchange history
    const exchangeHistory = await this.exchangeBookRepo
      .createQueryBuilder('eb')
      .leftJoinAndSelect('eb.exchange', 'e')
      .leftJoinAndSelect('e.member_a', 'memberA')
      .leftJoinAndSelect('memberA.user', 'userA')
      .leftJoinAndSelect('e.member_b', 'memberB')
      .leftJoinAndSelect('memberB.user', 'userB')
      .where('eb.book_id = :bookId', { bookId })
      .orderBy('e.created_at', 'DESC')
      .getMany();

    return {
      book: {
        book_id: book.book_id,
        title: book.title,
        author: book.author,
        publisher: book.publisher,
        publish_date: book.publish_date, // ✅ Correct field name
        description: book.description,
        status: book.status,
        book_condition: book.book_condition, // ✅ Correct field name
        user_photos: book.user_photos,
        owner_id: book.owner_id,
        created_at: book.created_at,
        deleted_at: book.deleted_at,
        owner: {
          member_id: book.owner.member_id,
          user_id: book.owner.user_id,
          email: book.owner.user?.email,
          region: book.owner.region, // ✅ No full_name in Member entity
          trust_score: book.owner.trust_score,
        },
      },
      statistics: {
        total_reports: reports.length,
        pending_reports: reports.filter(r => r.status === 'PENDING').length,
        resolved_reports: reports.filter(r => r.status === 'RESOLVED').length,
        total_exchanges: exchangeHistory.length,
        completed_exchanges: exchangeHistory.filter(eh => eh.exchange.status === 'COMPLETED').length,
      },
      reports: reports.map(r => ({
        report_id: r.report_id,
        report_type: r.report_type, // ✅ Correct field
        description: r.description, // ✅ No 'reason' field
        status: r.status,
        created_at: r.created_at, // ✅ Use created_at instead of report_date
        resolved_at: r.resolved_at, // ✅ Correct field name
        reporter: {
          member_id: r.reporter.member_id,
          email: r.reporter.user?.email,
          region: r.reporter.region, // ✅ No full_name in Member
        },
      })),
      exchange_history: exchangeHistory.map(eh => ({
        exchange_id: eh.exchange.exchange_id,
        request_id: eh.exchange.request_id, // ✅ Correct field name
        created_at: eh.exchange.created_at, // ✅ Use created_at instead of request_date
        status: eh.exchange.status,
        member_a: {
          member_id: eh.exchange.member_a.member_id, // ✅ Snake case
          email: eh.exchange.member_a.user?.email,
          region: eh.exchange.member_a.region, // ✅ No full_name
        },
        member_b: {
          member_id: eh.exchange.member_b.member_id, // ✅ Snake case
          email: eh.exchange.member_b.user?.email,
          region: eh.exchange.member_b.region, // ✅ No full_name
        },
      })),
    };
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
   * Resolve report (đã xử lý) - Với hệ thống xử phạt
   */
  async resolveReport(reportId: string, dto: ResolveReportDto, adminId: string, adminEmail: string) {
    const report = await this.reportRepo.findOne({ where: { report_id: reportId } });
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    // Lấy thông tin member bị báo cáo
    const reportedMember = await this.memberRepo.findOne({ 
      where: { member_id: report.reported_member_id },
      relations: ['user']
    });

    if (!reportedMember) {
      throw new NotFoundException('Reported member not found');
    }

    // Default penalty nếu không chọn
    const penalty = dto.penalty || 'WARNING';
    const trustScorePenalty = dto.trust_score_penalty || 0;

    // ========== THỰC HIỆN XỬ PHẠT ==========
    let penaltyMessage = '';
    
    switch (penalty) {
      case 'WARNING':
        // Chỉ cảnh cáo, giảm trust score nhẹ
        if (trustScorePenalty > 0) {
          reportedMember.trust_score = Math.max(0, (reportedMember.trust_score || 50) - trustScorePenalty);
          await this.memberRepo.save(reportedMember);
        }
        penaltyMessage = `Bạn đã bị cảnh cáo do vi phạm quy định cộng đồng.${trustScorePenalty > 0 ? ` Điểm uy tín của bạn đã bị trừ ${trustScorePenalty} điểm.` : ''}`;
        break;

      case 'CONTENT_REMOVAL':
        // Xóa/ẩn nội dung vi phạm + giảm trust score
        if (report.reported_item_type === 'BOOK' && report.reported_item_id) {
          const book = await this.bookRepo.findOne({ where: { book_id: report.reported_item_id } });
          if (book) {
            book.status = BookStatus.REMOVED;
            await this.bookRepo.save(book);
          }
        }
        if (trustScorePenalty > 0) {
          reportedMember.trust_score = Math.max(0, (reportedMember.trust_score || 50) - trustScorePenalty);
          await this.memberRepo.save(reportedMember);
        }
        penaltyMessage = `Nội dung vi phạm của bạn đã bị xóa.${trustScorePenalty > 0 ? ` Điểm uy tín của bạn đã bị trừ ${trustScorePenalty} điểm.` : ''}`;
        break;

      case 'TEMP_BAN':
        // Khóa tài khoản 7 ngày
        if (reportedMember.user) {
          reportedMember.user.account_status = AccountStatus.LOCKED;
          reportedMember.user.lock_reason = `Vi phạm quy định: ${report.report_type}. Tài khoản sẽ được mở sau 7 ngày.`;
          reportedMember.user.locked_until = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
          await this.userRepo.save(reportedMember.user);
        }
        if (trustScorePenalty > 0) {
          reportedMember.trust_score = Math.max(0, (reportedMember.trust_score || 50) - trustScorePenalty);
          await this.memberRepo.save(reportedMember);
        }
        penaltyMessage = `Tài khoản của bạn đã bị khóa 7 ngày do vi phạm nghiêm trọng quy định cộng đồng.`;
        break;

      case 'PERMANENT_BAN':
        // Khóa vĩnh viễn
        if (reportedMember.user) {
          reportedMember.user.account_status = AccountStatus.LOCKED;
          reportedMember.user.lock_reason = `Vi phạm nghiêm trọng: ${report.report_type}. Tài khoản bị khóa vĩnh viễn.`;
          reportedMember.user.locked_until = null; // Vĩnh viễn
          await this.userRepo.save(reportedMember.user);
        }
        reportedMember.trust_score = 0;
        await this.memberRepo.save(reportedMember);
        penaltyMessage = `Tài khoản của bạn đã bị khóa vĩnh viễn do vi phạm nghiêm trọng.`;
        break;

      case 'NONE':
      default:
        penaltyMessage = 'Admin đã xem xét báo cáo và đưa ra cảnh báo.';
        break;
    }

    // Cập nhật report
    report.status = ReportStatus.RESOLVED;
    report.resolution = dto.resolution;
    report.resolved_at = new Date();
    report.resolved_by = adminId;

    await this.reportRepo.save(report);

    // Log audit với chi tiết xử phạt
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.RESOLVE_REPORT,
      entity_type: 'REPORT',
      entity_id: reportId,
      old_value: { status: ReportStatus.PENDING },
      new_value: { 
        status: ReportStatus.RESOLVED, 
        resolution: dto.resolution,
        penalty: penalty,
        trust_score_penalty: trustScorePenalty
      },
      reason: dto.resolution,
    });

    // Send notification to reporter (người báo cáo)
    try {
      await this.notificationsService.create(
        report.reporter_id,
        'REPORT_RESOLVED',
        {
          report_id: reportId,
          report_type: report.report_type,
          resolution: dto.resolution,
          message: 'Báo cáo của bạn đã được xem xét và xử lý. Cảm ơn bạn đã góp phần giữ gìn cộng đồng.',
        }
      );
    } catch (err) {
      this.logger.warn(`Failed to send notification to reporter: ${err.message}`);
    }

    // Send notification to reported member (người bị báo cáo) với chi tiết xử phạt
    try {
      await this.notificationsService.create(
        report.reported_member_id,
        'REPORT_ACTION_TAKEN',
        {
          report_id: reportId,
          report_type: report.report_type,
          penalty: penalty,
          trust_score_penalty: trustScorePenalty,
          message: penaltyMessage,
        }
      );
    } catch (err) {
      this.logger.warn(`Failed to send notification to reported member: ${err.message}`);
    }

    this.logger.log(`Admin ${adminEmail} resolved report ${reportId} with penalty: ${penalty}`);

    return { 
      success: true, 
      message: 'Report resolved successfully',
      penalty_applied: penalty,
      trust_score_deducted: trustScorePenalty
    };
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
    report.resolved_by = adminId; // DB dùng resolved_by không phải assigned_to

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

    // Send notification to reporter (người báo cáo) về việc báo cáo bị từ chối
    try {
      await this.notificationsService.create(
        report.reporter_id,
        'REPORT_DISMISSED',
        {
          report_id: reportId,
          report_type: report.report_type,
          reason: dto.reason,
          message: 'Báo cáo của bạn đã được xem xét nhưng không phát hiện vi phạm.',
        }
      );
    } catch (err) {
      this.logger.warn(`Failed to send notification to reporter: ${err.message}`);
    }

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

    return {
      items,
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
      relations: ['member_a', 'member_b', 'member_a.user', 'member_b.user', 'request', 'exchange_books', 'exchange_books.book'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    return exchange;
  }

  /**
   * Cancel exchange (admin force cancel)
   */
  async cancelExchange(exchangeId: string, dto: CancelExchangeDto, adminId: string, adminEmail: string) {
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

    // ✅ FIX: Release all books back to AVAILABLE
    const exchangeBooks = await this.exchangeBookRepo.find({
      where: { exchange_id: exchangeId },
      relations: ['book'],
    });

    for (const eb of exchangeBooks) {
      if (eb.book && eb.book.status === BookStatus.EXCHANGING) {
        eb.book.status = BookStatus.AVAILABLE;
        await this.bookRepo.save(eb.book);
        this.logger.log(`Released book ${eb.book.book_id} back to AVAILABLE`);
      }
    }

    // ✅ Send notifications to both members
    try {
      await this.notificationsService.create(
        exchange.member_a_id,
        'ADMIN_ACTION',
        {
          title: 'Giao dịch đã bị Admin hủy',
          message: `Giao dịch #${exchangeId.slice(0, 8)} đã bị hủy bởi Admin. Lý do: ${dto.reason}`,
          exchange_id: exchangeId,
          reason: dto.reason,
        }
      );

      await this.notificationsService.create(
        exchange.member_b_id,
        'ADMIN_ACTION',
        {
          title: 'Giao dịch đã bị Admin hủy',
          message: `Giao dịch #${exchangeId.slice(0, 8)} đã bị hủy bởi Admin. Lý do: ${dto.reason}`,
          exchange_id: exchangeId,
          reason: dto.reason,
        }
      );
    } catch (error) {
      this.logger.warn(`Failed to send notifications: ${error.message}`);
      // Don't throw error, notification failure shouldn't stop the cancel operation
    }

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

    this.logger.warn(`Admin ${adminEmail} cancelled exchange ${exchangeId}: ${dto.reason}`);

    return { 
      success: true, 
      message: 'Exchange cancelled successfully', 
      books_released: exchangeBooks.length 
    };
  }

  /**
   * Thống kê exchanges cho admin
   */
  async getExchangeStats() {
    const totalExchanges = await this.exchangeRepo.count();
    const completedExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.COMPLETED } 
    });
    const pendingExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.PENDING } 
    });
    const acceptedExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.ACCEPTED } 
    });
    const meetingScheduledExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.MEETING_SCHEDULED } 
    });
    const inProgressExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.IN_PROGRESS } 
    });
    const cancelledExchanges = await this.exchangeRepo.count({ 
      where: { status: ExchangeStatus.CANCELLED } 
    });
    
    // "Đang xử lý" = PENDING + ACCEPTED + MEETING_SCHEDULED + IN_PROGRESS
    const processingExchanges = pendingExchanges + acceptedExchanges + meetingScheduledExchanges + inProgressExchanges;

    // Tính tỷ lệ thành công
    const successRate = totalExchanges > 0 
      ? (completedExchanges / totalExchanges) * 100 
      : 0;

    // Tính avg time to complete (giờ)
    const avgTimeResult = await this.exchangeRepo
      .createQueryBuilder('e')
      .select('AVG(TIMESTAMPDIFF(HOUR, e.created_at, e.completed_at))', 'avg_hours')
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
      .innerJoin('members', 'm', '(e.member_a_id = m.member_id OR e.member_b_id = m.member_id)')
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
        meeting_scheduled: meetingScheduledExchanges,
        in_progress: inProgressExchanges,
        processing: processingExchanges, // PENDING + ACCEPTED + MEETING_SCHEDULED + IN_PROGRESS
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
      qb.andWhere('m.conversation_id = :conversationId', { conversationId: dto.conversationId });
    }

    // Filter theo sender
    if (dto.senderId) {
      qb.andWhere('m.sender_id = :senderId', { senderId: dto.senderId });
    }

    // Filter theo deleted status
    if (dto.deletedOnly) {
      qb.andWhere('m.deleted_at IS NOT NULL');
    } else {
      // Mặc định chỉ show messages chưa bị xóa
      qb.andWhere('m.deleted_at IS NULL');
    }

    // Search trong content
    if (dto.search) {
      qb.andWhere('m.content LIKE :search', { search: `%${dto.search}%` });
    }

    qb.orderBy('m.sent_at', 'DESC');

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
   * Xem chi tiết conversation (admin view)
   */
  async getConversationDetail(conversationId: string) {
    const conversation = await this.conversationRepo.findOne({
      where: { conversation_id: conversationId },
      relations: ['member_a', 'member_b', 'member_a.user', 'member_b.user', 'exchange_request'],
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
  async removeMessage(messageId: string, dto: RemoveMessageDto, adminId: string, adminEmail: string) {
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

    this.logger.warn(`Admin ${adminEmail} removed message ${messageId}: ${dto.reason}`);

    return { success: true, message: 'Message removed successfully' };
  }

  // ============================================================
  // USER ACTIVITY TRACKING (Admin View)
  // ============================================================

  /**
   * Xem activities của 1 user (admin only)
   */
  async getUserActivities(userId: string, options?: {
    page?: number;
    limit?: number;
    action?: string;
    startDate?: string;
    endDate?: string;
  }) {
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

    const activities = await this.activityLogService.getUserActivities(userId, parsedOptions);
    
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

    const stats = await this.activityLogService.getUserActivityStats(userId, days);
    
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
      this.logger.warn('If this is unexpected run the DB migrations to create audit_logs table.');
    }
  }

  // ============================================================
  // SPAM/FRAUD DETECTION
  // ============================================================

  /**
   * 🔍 Phát hiện hoạt động đáng ngờ
   * Detect suspicious user activities based on behavior patterns
   */
  async getSuspiciousActivities(dto: QuerySuspiciousActivitiesDto) {
    const { type, hours = 24, page = 1, limit = 20 } = dto;
    const timeThreshold = new Date(Date.now() - hours * 60 * 60 * 1000);

    const suspiciousUsers: any[] = [];

    // 1. HIGH_BOOK_CREATION: Users creating too many books in short time
    if (!type || type === SuspiciousActivityType.HIGH_BOOK_CREATION) {
      const query = this.bookRepo
        .createQueryBuilder('book')
        .select('book.owner_id', 'user_id')
        .addSelect('COUNT(*)', 'book_count')
        .addSelect('MIN(book.created_at)', 'first_book_at')
        .addSelect('MAX(book.created_at)', 'last_book_at')
        .where('book.created_at >= :timeThreshold', { timeThreshold })
        .groupBy('book.owner_id')
        .having('COUNT(*) > :threshold', { threshold: hours <= 1 ? 5 : 10 });

      const results = await query.getRawMany();

      for (const result of results) {
        const user = await this.userRepo.findOne({
          where: { user_id: result.user_id },
          relations: ['member'],
        });

        if (user) {
          suspiciousUsers.push({
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            account_status: user.account_status,
            trust_score: user.member?.trust_score || 50.0,
            suspicious_type: SuspiciousActivityType.HIGH_BOOK_CREATION,
            severity: 'HIGH',
            details: {
              book_count: parseInt(result.book_count),
              time_span_hours: hours,
              first_activity: result.first_book_at,
              last_activity: result.last_book_at,
            },
            detected_at: new Date(),
          });
        }
      }
    }

    // 2. HIGH_MESSAGE_VOLUME: Users sending too many messages
    if (!type || type === SuspiciousActivityType.HIGH_MESSAGE_VOLUME) {
      const query = this.messageRepo
        .createQueryBuilder('message')
        .select('message.sender_id', 'user_id')
        .addSelect('COUNT(*)', 'message_count')
        .where('message.created_at >= :timeThreshold', { timeThreshold })
        .groupBy('message.sender_id')
        .having('COUNT(*) > :threshold', { threshold: hours <= 1 ? 50 : 100 });

      const results = await query.getRawMany();

      for (const result of results) {
        const user = await this.userRepo.findOne({
          where: { user_id: result.user_id },
          relations: ['member'],
        });

        if (user) {
          suspiciousUsers.push({
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            account_status: user.account_status,
            trust_score: user.member?.trust_score || 50.0,
            suspicious_type: SuspiciousActivityType.HIGH_MESSAGE_VOLUME,
            severity: 'MEDIUM',
            details: {
              message_count: parseInt(result.message_count),
              time_span_hours: hours,
            },
            detected_at: new Date(),
          });
        }
      }
    }

    // 3. NEW_ACCOUNT_HIGH_ACTIVITY: New accounts with unusually high activity
    if (!type || type === SuspiciousActivityType.NEW_ACCOUNT_HIGH_ACTIVITY) {
      const newAccountThreshold = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000); // 7 days

      const newUsers = await this.userRepo.find({
        where: {
          created_at: LessThan(newAccountThreshold),
          account_status: AccountStatus.ACTIVE,
        },
        relations: ['member'],
      });

      for (const user of newUsers) {
        const bookCount = await this.bookRepo.count({
          where: { owner_id: user.user_id },
        });

        const exchangeCount = await this.exchangeRepo
          .createQueryBuilder('exchange')
          .where('exchange.member_a_id = :memberId OR exchange.member_b_id = :memberId', {
            memberId: user.member?.member_id,
          })
          .getCount();

        // New account but very active (red flag)
        if (bookCount > 5 || exchangeCount > 3) {
          suspiciousUsers.push({
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            account_status: user.account_status,
            trust_score: user.member?.trust_score || 50.0,
            suspicious_type: SuspiciousActivityType.NEW_ACCOUNT_HIGH_ACTIVITY,
            severity: 'MEDIUM',
            details: {
              account_age_days: Math.floor(
                (Date.now() - new Date(user.created_at).getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
              book_count: bookCount,
              exchange_count: exchangeCount,
            },
            detected_at: new Date(),
          });
        }
      }
    }

    // 4. TRUST_SCORE_DROP: Users with rapid trust score decline
    if (!type || type === SuspiciousActivityType.TRUST_SCORE_DROP) {
      const lowTrustUsers = await this.memberRepo
        .createQueryBuilder('member')
        .leftJoinAndSelect('member.user', 'user')
        .where('member.trust_score < :threshold', { threshold: 30 })
        .andWhere('user.account_status = :status', {
          status: AccountStatus.ACTIVE,
        })
        .getMany();

      for (const member of lowTrustUsers) {
        suspiciousUsers.push({
          user_id: member.user.user_id,
          email: member.user.email,
          full_name: member.user.full_name,
          account_status: member.user.account_status,
          trust_score: member.trust_score,
          suspicious_type: SuspiciousActivityType.TRUST_SCORE_DROP,
          severity: member.trust_score < 20 ? 'HIGH' : 'MEDIUM',
          details: {
            current_trust_score: member.trust_score,
            threshold: 30,
          },
          detected_at: new Date(),
        });
      }
    }

    // 5. MULTIPLE_REPORTS: Users with multiple reports against them
    // TODO: Enable when reports table is created
    /*
    if (!type || type === SuspiciousActivityType.MULTIPLE_REPORTS) {
      const reportsQuery = this.reportRepo
        .createQueryBuilder('report')
        .select('report.reported_entity_id', 'user_id')
        .addSelect('COUNT(*)', 'report_count')
        .where('report.reported_entity_type = :entityType', {
          entityType: 'USER',
        })
        .andWhere('report.status = :status', { status: ReportStatus.PENDING })
        .groupBy('report.reported_entity_id')
        .having('COUNT(*) >= :threshold', { threshold: 2 });

      const results = await reportsQuery.getRawMany();

      for (const result of results) {
        const user = await this.userRepo.findOne({
          where: { user_id: result.user_id },
          relations: ['member'],
        });

        if (user) {
          suspiciousUsers.push({
            user_id: user.user_id,
            email: user.email,
            full_name: user.full_name,
            account_status: user.account_status,
            trust_score: user.member?.trust_score || 50.0,
            suspicious_type: SuspiciousActivityType.MULTIPLE_REPORTS,
            severity: parseInt(result.report_count) >= 5 ? 'HIGH' : 'MEDIUM',
            details: {
              pending_report_count: parseInt(result.report_count),
            },
            detected_at: new Date(),
          });
        }
      }
    }
    */

    // Remove duplicates and sort by severity
    const uniqueUsers = Array.from(
      new Map(suspiciousUsers.map((u) => [u.user_id, u])).values(),
    );

    const sortedUsers = uniqueUsers.sort((a, b) => {
      const severityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      return severityOrder[b.severity] - severityOrder[a.severity];
    });

    // Pagination
    const total = sortedUsers.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedUsers = sortedUsers.slice(startIndex, endIndex);

    return {
      items: paginatedUsers,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      summary: {
        total_suspicious_users: total,
        high_severity: sortedUsers.filter((u) => u.severity === 'HIGH').length,
        medium_severity: sortedUsers.filter((u) => u.severity === 'MEDIUM')
          .length,
        by_type: {
          high_book_creation: sortedUsers.filter(
            (u) => u.suspicious_type === SuspiciousActivityType.HIGH_BOOK_CREATION,
          ).length,
          high_message_volume: sortedUsers.filter(
            (u) => u.suspicious_type === SuspiciousActivityType.HIGH_MESSAGE_VOLUME,
          ).length,
          new_account_high_activity: sortedUsers.filter(
            (u) => u.suspicious_type === SuspiciousActivityType.NEW_ACCOUNT_HIGH_ACTIVITY,
          ).length,
          trust_score_drop: sortedUsers.filter(
            (u) => u.suspicious_type === SuspiciousActivityType.TRUST_SCORE_DROP,
          ).length,
          multiple_reports: sortedUsers.filter(
            (u) => u.suspicious_type === SuspiciousActivityType.MULTIPLE_REPORTS,
          ).length,
        },
      },
    };
  }

  // ============================================================
  // TRUST SCORE MANAGEMENT
  // ============================================================

  /**
   * 📊 Lấy lịch sử trust score của member
   */
  async getTrustScoreHistory(memberId: string) {
    const member = await this.memberRepo.findOne({
      where: { member_id: memberId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const history = await this.trustScoreHistoryRepo.find({
      where: { member_id: memberId },
      order: { created_at: 'DESC' },
      take: 50,
    });

    // Get admin names for history items
    const historyWithAdminNames = await Promise.all(
      history.map(async (item) => {
        let admin_name: string | null = null;
        if (item.admin_id) {
          const admin = await this.userRepo.findOne({
            where: { user_id: item.admin_id },
          });
          admin_name = admin?.full_name || admin?.email || null;
        }

        return {
          change_id: item.change_id,
          old_score: item.old_score,
          new_score: item.new_score,
          change_amount: item.change_amount,
          reason: item.reason,
          source: item.source,
          admin_id: item.admin_id,
          admin_name,
          metadata: item.metadata,
          created_at: item.created_at,
        };
      }),
    );

    return {
      member: {
        member_id: member.member_id,
        user_id: member.user.user_id,
        email: member.user.email,
        full_name: member.user.full_name,
        current_trust_score: member.trust_score,
      },
      history: historyWithAdminNames,
      total_changes: history.length,
    };
  }

  /**
   * ✏️ Admin manual adjustment của trust score
   */
  async adjustTrustScore(
    memberId: string,
    dto: AdjustTrustScoreDto,
    adminId: string,
    adminEmail: string,
  ) {
    const member = await this.memberRepo.findOne({
      where: { member_id: memberId },
      relations: ['user'],
    });

    if (!member) {
      throw new NotFoundException('Member not found');
    }

    const oldScore = member.trust_score;
    let newScore = oldScore + dto.adjustment;

    // Clamp between 0 and 100
    newScore = Math.max(0, Math.min(100, newScore));

    // Update member trust score
    member.trust_score = newScore;
    await this.memberRepo.save(member);

    // Log trust score change
    const { v4: uuidv4 } = await import('uuid');
    const historyEntry = this.trustScoreHistoryRepo.create({
      change_id: uuidv4(),
      member_id: memberId,
      old_score: oldScore,
      new_score: newScore,
      change_amount: dto.adjustment,
      reason: dto.reason,
      source: TrustScoreSource.ADMIN,
      admin_id: adminId,
      metadata: {
        adjusted_by: adminEmail,
        timestamp: new Date().toISOString(),
      },
    });

    await this.trustScoreHistoryRepo.save(historyEntry);

    // Audit log
    await this.createAuditLog({
      admin_id: adminId,
      admin_email: adminEmail,
      action: AuditAction.ADJUST_TRUST_SCORE,
      entity_type: 'MEMBER',
      entity_id: memberId,
      old_value: { trust_score: oldScore },
      new_value: { trust_score: newScore, reason: dto.reason },
    });

    // Send notification to user
    try {
      await this.notificationsService.create(
        member.user.user_id,
        'TRUST_SCORE_ADJUSTED',
        {
          old_score: oldScore,
          new_score: newScore,
          change: dto.adjustment,
          reason: dto.reason,
          message:
            dto.adjustment > 0
              ? `Trust score của bạn đã được tăng ${dto.adjustment} điểm lên ${newScore.toFixed(1)} bởi admin.`
              : `Trust score của bạn đã bị giảm ${Math.abs(dto.adjustment)} điểm xuống ${newScore.toFixed(1)} bởi admin. Lý do: ${dto.reason}`,
        },
      );
    } catch (err) {
      this.logger.warn('Failed to send trust score adjustment notification:', err);
    }

    this.logger.log(
      `[TRUST SCORE] Admin ${adminEmail} adjusted member ${member.user.email} trust score: ${oldScore} → ${newScore} (${dto.adjustment >= 0 ? '+' : ''}${dto.adjustment})`,
    );

    return {
      success: true,
      member_id: memberId,
      user: {
        user_id: member.user.user_id,
        email: member.user.email,
        full_name: member.user.full_name,
      },
      old_score: oldScore,
      new_score: newScore,
      change_amount: dto.adjustment,
      reason: dto.reason,
      adjusted_by: adminEmail,
      adjusted_at: new Date(),
    };
  }

  /**
   * 🏆 Trust Score Leaderboard
   */
  async getTrustScoreLeaderboard(limit: number = 50) {
    const topMembers = await this.memberRepo
      .createQueryBuilder('member')
      .leftJoinAndSelect('member.user', 'user')
      .where('user.account_status = :status', { status: AccountStatus.ACTIVE })
      .orderBy('member.trust_score', 'DESC')
      .take(limit)
      .getMany();

    return {
      leaderboard: topMembers.map((member, index) => ({
        rank: index + 1,
        member_id: member.member_id,
        user_id: member.user.user_id,
        email: member.user.email,
        full_name: member.user.full_name,
        trust_score: member.trust_score,
        region: member.region,
      })),
      total: topMembers.length,
    };
  }

  // ============================================================
  // SYSTEM REPORTS - BÁO CÁO TỔNG THỂ HỆ THỐNG
  // ============================================================

  /**
   * 📊 Báo cáo tổng quan hệ thống
   */
  async getSystemOverview() {
    // User stats
    const totalUsers = await this.userRepo.count();
    const activeUsers = await this.userRepo.count({ where: { account_status: AccountStatus.ACTIVE } });
    const lockedUsers = await this.userRepo.count({ where: { account_status: AccountStatus.LOCKED } });
    const suspendedUsers = await this.userRepo.count({ where: { account_status: AccountStatus.SUSPENDED } });

    // New users in last 7 and 30 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const newUsersLast7Days = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    const newUsersLast30Days = await this.userRepo
      .createQueryBuilder('u')
      .where('u.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // Member stats
    const totalMembers = await this.memberRepo.count();
    const avgTrustScore = await this.memberRepo
      .createQueryBuilder('m')
      .select('AVG(m.trust_score)', 'avg')
      .getRawOne();
    
    const trustScoreStats = await this.memberRepo
      .createQueryBuilder('m')
      .select('MIN(m.trust_score)', 'min')
      .addSelect('MAX(m.trust_score)', 'max')
      .addSelect('COUNT(CASE WHEN m.trust_score < 30 THEN 1 END)', 'low_count')
      .addSelect('COUNT(CASE WHEN m.trust_score >= 30 AND m.trust_score < 70 THEN 1 END)', 'medium_count')
      .addSelect('COUNT(CASE WHEN m.trust_score >= 70 THEN 1 END)', 'high_count')
      .getRawOne();

    // Book stats
    const totalBooks = await this.bookRepo.count();
    const availableBooks = await this.bookRepo.count({ where: { status: BookStatus.AVAILABLE } });
    const exchangingBooks = await this.bookRepo.count({ where: { status: BookStatus.EXCHANGING } });
    const removedBooks = await this.bookRepo.count({ where: { status: BookStatus.REMOVED } });

    const newBooksLast7Days = await this.bookRepo
      .createQueryBuilder('b')
      .where('b.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    const newBooksLast30Days = await this.bookRepo
      .createQueryBuilder('b')
      .where('b.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    // Exchange stats
    const totalExchanges = await this.exchangeRepo.count();
    const completedExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.COMPLETED } });
    const pendingExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.PENDING } });
    const acceptedExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.ACCEPTED } });
    const inProgressExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.IN_PROGRESS } });
    const cancelledExchanges = await this.exchangeRepo.count({ where: { status: ExchangeStatus.CANCELLED } });

    const newExchangesLast7Days = await this.exchangeRepo
      .createQueryBuilder('e')
      .where('e.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    const newExchangesLast30Days = await this.exchangeRepo
      .createQueryBuilder('e')
      .where('e.created_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .getCount();

    const completedLast30Days = await this.exchangeRepo
      .createQueryBuilder('e')
      .where('e.completed_at >= :thirtyDaysAgo', { thirtyDaysAgo })
      .andWhere('e.status = :status', { status: ExchangeStatus.COMPLETED })
      .getCount();

    // Average completion time (hours)
    const avgCompletionTime = await this.exchangeRepo
      .createQueryBuilder('e')
      .select('AVG(TIMESTAMPDIFF(HOUR, e.created_at, e.completed_at))', 'avg_hours')
      .where('e.status = :status', { status: ExchangeStatus.COMPLETED })
      .andWhere('e.completed_at IS NOT NULL')
      .getRawOne();

    // Report stats
    const totalReports = await this.reportRepo.count();
    const pendingReports = await this.reportRepo.count({ where: { status: ReportStatus.PENDING } });
    const resolvedReports = await this.reportRepo.count({ where: { status: ReportStatus.RESOLVED } });
    const dismissedReports = await this.reportRepo.count({ where: { status: ReportStatus.DISMISSED } });

    const newReportsLast7Days = await this.reportRepo
      .createQueryBuilder('r')
      .where('r.created_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    // Review stats
    const totalReviews = await this.reviewRepo.count();
    const avgRating = await this.reviewRepo
      .createQueryBuilder('r')
      .select('AVG(r.rating)', 'avg')
      .getRawOne();

    const ratingDistribution = await this.reviewRepo
      .createQueryBuilder('r')
      .select('r.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .groupBy('r.rating')
      .orderBy('r.rating', 'DESC')
      .getRawMany();

    // Message stats
    const totalMessages = await this.messageRepo.count();
    const totalConversations = await this.conversationRepo.count();
    
    const messagesLast7Days = await this.messageRepo
      .createQueryBuilder('m')
      .where('m.sent_at >= :sevenDaysAgo', { sevenDaysAgo })
      .getCount();

    return {
      users: {
        total: totalUsers,
        active: activeUsers,
        locked: lockedUsers,
        suspended: suspendedUsers,
        active_rate: totalUsers > 0 ? ((activeUsers / totalUsers) * 100).toFixed(1) : 0,
        new_last_7_days: newUsersLast7Days,
        new_last_30_days: newUsersLast30Days,
      },
      members: {
        total: totalMembers,
        avg_trust_score: parseFloat(avgTrustScore?.avg || 0).toFixed(2),
        min_trust_score: parseFloat(trustScoreStats?.min || 0).toFixed(2),
        max_trust_score: parseFloat(trustScoreStats?.max || 0).toFixed(2),
        low_trust_count: parseInt(trustScoreStats?.low_count || 0),
        medium_trust_count: parseInt(trustScoreStats?.medium_count || 0),
        high_trust_count: parseInt(trustScoreStats?.high_count || 0),
      },
      books: {
        total: totalBooks,
        available: availableBooks,
        exchanging: exchangingBooks,
        removed: removedBooks,
        new_last_7_days: newBooksLast7Days,
        new_last_30_days: newBooksLast30Days,
      },
      exchanges: {
        total: totalExchanges,
        completed: completedExchanges,
        pending: pendingExchanges,
        accepted: acceptedExchanges,
        in_progress: inProgressExchanges,
        cancelled: cancelledExchanges,
        success_rate: totalExchanges > 0 ? ((completedExchanges / totalExchanges) * 100).toFixed(1) : 0,
        new_last_7_days: newExchangesLast7Days,
        new_last_30_days: newExchangesLast30Days,
        completed_last_30_days: completedLast30Days,
        avg_completion_hours: parseFloat(avgCompletionTime?.avg_hours || 0).toFixed(1),
      },
      reports: {
        total: totalReports,
        pending: pendingReports,
        resolved: resolvedReports,
        dismissed: dismissedReports,
        resolve_rate: totalReports > 0 ? ((resolvedReports / totalReports) * 100).toFixed(1) : 0,
        new_last_7_days: newReportsLast7Days,
      },
      reviews: {
        total: totalReviews,
        avg_rating: parseFloat(avgRating?.avg || 0).toFixed(2),
        rating_distribution: ratingDistribution.map(r => ({
          rating: parseInt(r.rating),
          count: parseInt(r.count),
        })),
      },
      messages: {
        total: totalMessages,
        conversations: totalConversations,
        last_7_days: messagesLast7Days,
      },
      generated_at: new Date(),
    };
  }

  /**
   * 📈 Báo cáo xu hướng theo thời gian (7, 30, 90 ngày)
   */
  async getSystemTrends(days: number = 30) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // New users by day
    const newUsersByDay = await this.userRepo
      .createQueryBuilder('u')
      .select("DATE(u.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('u.created_at >= :startDate', { startDate })
      .groupBy('DATE(u.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // New books by day
    const newBooksByDay = await this.bookRepo
      .createQueryBuilder('b')
      .select("DATE(b.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('b.created_at >= :startDate', { startDate })
      .groupBy('DATE(b.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // New exchanges by day
    const newExchangesByDay = await this.exchangeRepo
      .createQueryBuilder('e')
      .select("DATE(e.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('e.created_at >= :startDate', { startDate })
      .groupBy('DATE(e.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // Completed exchanges by day
    const completedExchangesByDay = await this.exchangeRepo
      .createQueryBuilder('e')
      .select("DATE(e.completed_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('e.completed_at >= :startDate', { startDate })
      .andWhere('e.status = :status', { status: ExchangeStatus.COMPLETED })
      .groupBy('DATE(e.completed_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    // New reports by day
    const newReportsByDay = await this.reportRepo
      .createQueryBuilder('r')
      .select("DATE(r.created_at)", 'date')
      .addSelect('COUNT(*)', 'count')
      .where('r.created_at >= :startDate', { startDate })
      .groupBy('DATE(r.created_at)')
      .orderBy('date', 'ASC')
      .getRawMany();

    return {
      period_days: days,
      start_date: startDate,
      end_date: new Date(),
      trends: {
        new_users: newUsersByDay,
        new_books: newBooksByDay,
        new_exchanges: newExchangesByDay,
        completed_exchanges: completedExchangesByDay,
        new_reports: newReportsByDay,
      },
      summary: {
        total_new_users: newUsersByDay.reduce((sum, d) => sum + parseInt(d.count), 0),
        total_new_books: newBooksByDay.reduce((sum, d) => sum + parseInt(d.count), 0),
        total_new_exchanges: newExchangesByDay.reduce((sum, d) => sum + parseInt(d.count), 0),
        total_completed_exchanges: completedExchangesByDay.reduce((sum, d) => sum + parseInt(d.count), 0),
        total_new_reports: newReportsByDay.reduce((sum, d) => sum + parseInt(d.count), 0),
      },
    };
  }

  /**
   * 📍 Báo cáo theo vùng (region)
   */
  async getRegionReport() {
    // Members by region
    const membersByRegion = await this.memberRepo
      .createQueryBuilder('m')
      .select('m.region', 'region')
      .addSelect('COUNT(*)', 'member_count')
      .groupBy('m.region')
      .orderBy('member_count', 'DESC')
      .getRawMany();

    // Books by owner's region
    const booksByRegion = await this.bookRepo
      .createQueryBuilder('b')
      .leftJoin('b.owner', 'owner')
      .select('owner.region', 'region')
      .addSelect('COUNT(*)', 'book_count')
      .groupBy('owner.region')
      .orderBy('book_count', 'DESC')
      .getRawMany();

    // Exchanges by region (member_a's region)
    const exchangesByRegion = await this.exchangeRepo
      .createQueryBuilder('e')
      .leftJoin('e.member_a', 'member_a')
      .select('member_a.region', 'region')
      .addSelect('COUNT(*)', 'exchange_count')
      .groupBy('member_a.region')
      .orderBy('exchange_count', 'DESC')
      .getRawMany();

    // Avg trust score by region
    const avgTrustByRegion = await this.memberRepo
      .createQueryBuilder('m')
      .select('m.region', 'region')
      .addSelect('AVG(m.trust_score)', 'avg_trust_score')
      .addSelect('MIN(m.trust_score)', 'min_trust_score')
      .addSelect('MAX(m.trust_score)', 'max_trust_score')
      .groupBy('m.region')
      .orderBy('avg_trust_score', 'DESC')
      .getRawMany();

    return {
      members_by_region: membersByRegion,
      books_by_region: booksByRegion,
      exchanges_by_region: exchangesByRegion,
      trust_score_by_region: avgTrustByRegion.map(r => ({
        region: r.region,
        avg_trust_score: parseFloat(r.avg_trust_score || 0).toFixed(2),
        min_trust_score: parseFloat(r.min_trust_score || 0).toFixed(2),
        max_trust_score: parseFloat(r.max_trust_score || 0).toFixed(2),
      })),
    };
  }

  /**
   * 📚 Báo cáo sách theo thể loại
   */
  async getBookCategoryReport() {
    const booksByCategory = await this.bookRepo
      .createQueryBuilder('b')
      .select('b.category', 'category')
      .addSelect('COUNT(*)', 'total')
      .addSelect('SUM(CASE WHEN b.status = :available THEN 1 ELSE 0 END)', 'available')
      .addSelect('SUM(CASE WHEN b.status = :exchanging THEN 1 ELSE 0 END)', 'exchanging')
      .setParameters({ 
        available: BookStatus.AVAILABLE, 
        exchanging: BookStatus.EXCHANGING 
      })
      .groupBy('b.category')
      .orderBy('total', 'DESC')
      .getRawMany();

    return {
      categories: booksByCategory.map(c => ({
        category: c.category || 'Không xác định',
        total: parseInt(c.total),
        available: parseInt(c.available) || 0,
        exchanging: parseInt(c.exchanging) || 0,
      })),
      total_categories: booksByCategory.length,
    };
  }

  /**
   * 🏆 Top performers report
   */
  async getTopPerformersReport() {
    // Top users by completed exchanges
    const topExchangers = await this.memberRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoin('exchanges', 'e', '(e.member_a_id = m.member_id OR e.member_b_id = m.member_id) AND e.status = :status', { status: ExchangeStatus.COMPLETED })
      .select('m.member_id', 'member_id')
      .addSelect('u.full_name', 'full_name')
      .addSelect('u.email', 'email')
      .addSelect('m.trust_score', 'trust_score')
      .addSelect('COUNT(e.exchange_id)', 'exchange_count')
      .groupBy('m.member_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.email')
      .addGroupBy('m.trust_score')
      .orderBy('exchange_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top book contributors
    const topBookContributors = await this.memberRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoin('books', 'b', 'b.owner_id = m.member_id')
      .select('m.member_id', 'member_id')
      .addSelect('u.full_name', 'full_name')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(b.book_id)', 'book_count')
      .groupBy('m.member_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.email')
      .orderBy('book_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Top reviewers
    const topReviewers = await this.memberRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoin('reviews', 'r', 'r.reviewer_id = m.member_id')
      .select('m.member_id', 'member_id')
      .addSelect('u.full_name', 'full_name')
      .addSelect('u.email', 'email')
      .addSelect('COUNT(r.review_id)', 'review_count')
      .addSelect('AVG(r.rating)', 'avg_rating_given')
      .groupBy('m.member_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.email')
      .orderBy('review_count', 'DESC')
      .limit(10)
      .getRawMany();

    // Highest rated members
    const highestRated = await this.memberRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.user', 'u')
      .leftJoin('reviews', 'r', 'r.reviewee_id = m.member_id')
      .select('m.member_id', 'member_id')
      .addSelect('u.full_name', 'full_name')
      .addSelect('u.email', 'email')
      .addSelect('AVG(r.rating)', 'avg_rating')
      .addSelect('COUNT(r.review_id)', 'review_count')
      .groupBy('m.member_id')
      .addGroupBy('u.full_name')
      .addGroupBy('u.email')
      .having('COUNT(r.review_id) >= 3')
      .orderBy('avg_rating', 'DESC')
      .limit(10)
      .getRawMany();

    return {
      top_exchangers: topExchangers.map(t => ({
        ...t,
        exchange_count: parseInt(t.exchange_count),
        trust_score: parseFloat(t.trust_score).toFixed(2),
      })),
      top_book_contributors: topBookContributors.map(t => ({
        ...t,
        book_count: parseInt(t.book_count),
      })),
      top_reviewers: topReviewers.map(t => ({
        ...t,
        review_count: parseInt(t.review_count),
        avg_rating_given: parseFloat(t.avg_rating_given || 0).toFixed(2),
      })),
      highest_rated: highestRated.map(t => ({
        ...t,
        avg_rating: parseFloat(t.avg_rating || 0).toFixed(2),
        review_count: parseInt(t.review_count),
      })),
    };
  }

  /**
   * ⚠️ Báo cáo hoạt động đáng ngờ / cần chú ý
   */
  async getSystemAlerts() {
    const now = new Date();
    const last24h = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const last7d = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Pending reports (high priority first)
    const pendingReports = await this.reportRepo.count({
      where: { status: ReportStatus.PENDING },
    });

    const highPriorityReports = await this.reportRepo.count({
      where: { status: ReportStatus.PENDING, priority: ReportPriority.HIGH },
    });

    // Users locked in last 24h
    const recentlyLockedUsers = await this.userRepo
      .createQueryBuilder('u')
      .where('u.account_status = :status', { status: AccountStatus.LOCKED })
      .andWhere('u.updated_at >= :last24h', { last24h })
      .getCount();

    // Stale exchanges (pending > 7 days)
    const staleExchanges = await this.exchangeRepo
      .createQueryBuilder('e')
      .where('e.status = :status', { status: ExchangeStatus.PENDING })
      .andWhere('e.created_at < :last7d', { last7d })
      .getCount();

    // Low trust score users (< 30)
    const lowTrustUsers = await this.memberRepo
      .createQueryBuilder('m')
      .where('m.trust_score < :threshold', { threshold: 30 })
      .getCount();

    // Removed books in last 24h
    const recentlyRemovedBooks = await this.bookRepo
      .createQueryBuilder('b')
      .where('b.status = :status', { status: BookStatus.REMOVED })
      .andWhere('b.updated_at >= :last24h', { last24h })
      .getCount();

    // Cancelled exchanges in last 24h
    const recentlyCancelledExchanges = await this.exchangeRepo
      .createQueryBuilder('e')
      .where('e.status = :status', { status: ExchangeStatus.CANCELLED })
      .andWhere('e.updated_at >= :last24h', { last24h })
      .getCount();

    const alerts: Array<{
      type: string;
      severity: 'critical' | 'warning' | 'info';
      message: string;
      count: number;
    }> = [];

    if (highPriorityReports > 0) {
      alerts.push({
        type: 'HIGH_PRIORITY_REPORTS',
        severity: 'critical',
        message: `Có ${highPriorityReports} báo cáo ưu tiên cao cần xử lý`,
        count: highPriorityReports,
      });
    }

    if (pendingReports > 10) {
      alerts.push({
        type: 'PENDING_REPORTS',
        severity: 'warning',
        message: `Có ${pendingReports} báo cáo đang chờ xử lý`,
        count: pendingReports,
      });
    }

    if (staleExchanges > 0) {
      alerts.push({
        type: 'STALE_EXCHANGES',
        severity: 'warning',
        message: `Có ${staleExchanges} giao dịch chờ xác nhận quá 7 ngày`,
        count: staleExchanges,
      });
    }

    if (lowTrustUsers > 5) {
      alerts.push({
        type: 'LOW_TRUST_USERS',
        severity: 'info',
        message: `Có ${lowTrustUsers} người dùng có trust score dưới 30`,
        count: lowTrustUsers,
      });
    }

    if (recentlyLockedUsers > 0) {
      alerts.push({
        type: 'RECENTLY_LOCKED',
        severity: 'info',
        message: `${recentlyLockedUsers} tài khoản bị khóa trong 24h qua`,
        count: recentlyLockedUsers,
      });
    }

    if (recentlyCancelledExchanges > 3) {
      alerts.push({
        type: 'CANCELLED_EXCHANGES',
        severity: 'info',
        message: `${recentlyCancelledExchanges} giao dịch bị hủy trong 24h qua`,
        count: recentlyCancelledExchanges,
      });
    }

    return {
      alerts: alerts.sort((a, b) => {
        const severityOrder = { critical: 0, warning: 1, info: 2 };
        return severityOrder[a.severity] - severityOrder[b.severity];
      }),
      summary: {
        pending_reports: pendingReports,
        high_priority_reports: highPriorityReports,
        stale_exchanges: staleExchanges,
        low_trust_users: lowTrustUsers,
        recently_locked_users: recentlyLockedUsers,
        recently_removed_books: recentlyRemovedBooks,
        recently_cancelled_exchanges: recentlyCancelledExchanges,
      },
      generated_at: new Date(),
    };
  }

  /**
   * 📊 Export full system report
   */
  async getFullSystemReport() {
    const [overview, trends, regions, categories, topPerformers, alerts] = await Promise.all([
      this.getSystemOverview(),
      this.getSystemTrends(30),
      this.getRegionReport(),
      this.getBookCategoryReport(),
      this.getTopPerformersReport(),
      this.getSystemAlerts(),
    ]);

    return {
      report_name: 'BookSwap System Report',
      generated_at: new Date(),
      overview,
      trends,
      regions,
      categories,
      top_performers: topPerformers,
      alerts,
    };
  }
}


