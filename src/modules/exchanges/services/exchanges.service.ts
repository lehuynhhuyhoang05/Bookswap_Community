// src/modules/exchanges/services/exchanges.service.ts
import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, IsNull, LessThan, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Cron, CronExpression } from '@nestjs/schedule';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Book, BookStatus } from '../../../infrastructure/database/entities/book.entity';
import {
  ExchangeRequest,
  ExchangeRequestStatus,
} from '../../../infrastructure/database/entities/exchange-request.entity';
import {
  ExchangeRequestBook,
  BookType,
} from '../../../infrastructure/database/entities/exchange-request-book.entity';
import {
  Exchange,
  ExchangeStatus,
} from '../../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../../infrastructure/database/entities/exchange-book.entity';
import {
  CreateExchangeRequestDto,
  RespondToRequestDto,
  QueryExchangeRequestsDto,
  QueryExchangesDto,
} from '../dto/exchange.dto';
import { NotificationsService } from '../../notifications/services/notifications.service';
import { ActivityLogService } from '../../../common/services/activity-log.service';
import { UserActivityAction } from '../../../infrastructure/database/entities/user-activity-log.entity';

@Injectable()
export class ExchangesService {
  private readonly logger = new Logger(ExchangesService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(ExchangeRequest)
    private requestRepo: Repository<ExchangeRequest>,

    @InjectRepository(ExchangeRequestBook)
    private requestBookRepo: Repository<ExchangeRequestBook>,

    @InjectRepository(Exchange)
    private exchangeRepo: Repository<Exchange>,

    @InjectRepository(ExchangeBook)
    private exchangeBookRepo: Repository<ExchangeBook>,

    private notificationsService: NotificationsService,
    private activityLogService: ActivityLogService,
  ) { }

  // ==================== CRON: AUTO-EXPIRE REQUESTS ====================
  /**
   * Run every hour to expire pending requests that have passed their expiration date
   */
  @Cron(CronExpression.EVERY_HOUR)
  async handleExpiredRequests() {
    this.logger.log('[CRON] Checking for expired exchange requests...');

    try {
      // Find all PENDING requests that have expired
      const expiredRequests = await this.requestRepo.find({
        where: {
          status: ExchangeRequestStatus.PENDING,
          expires_at: LessThan(new Date()),
        },
        relations: ['request_books'],
      });

      if (expiredRequests.length === 0) {
        this.logger.log('[CRON] No expired requests found');
        return;
      }

      this.logger.log(`[CRON] Found ${expiredRequests.length} expired requests`);

      for (const request of expiredRequests) {
        // Update status to CANCELLED (expired)
        request.status = ExchangeRequestStatus.CANCELLED;
        await this.requestRepo.save(request);

        // Release books back to AVAILABLE
        const bookIds = request.request_books.map((rb) => rb.book_id);
        if (bookIds.length > 0) {
          await this.bookRepo.update(
            { book_id: In(bookIds) },
            { status: BookStatus.AVAILABLE },
          );
        }

        this.logger.log(`[CRON] Expired request ${request.request_id} - released ${bookIds.length} books`);
      }

      this.logger.log(`[CRON] Successfully expired ${expiredRequests.length} requests`);
    } catch (error) {
      this.logger.error('[CRON] Error expiring requests:', error);
    }
  }

  // ==================== CRON: AUTO-EXPIRE EXCHANGES ====================
  /**
   * Run every 6 hours to auto-cancel exchanges that exceeded expiration date
   * CRITICAL: Prevents books from being locked forever in EXCHANGING status
   */
  @Cron(CronExpression.EVERY_6_HOURS)
  async handleExpiredExchanges() {
    this.logger.log('[CRON] Checking for expired exchanges...');

    try {
      // Find all PENDING exchanges that have expired
      const expiredExchanges = await this.exchangeRepo.find({
        where: {
          status: ExchangeStatus.PENDING,
          expires_at: LessThan(new Date()),
        },
        relations: ['exchange_books'],
      });

      if (expiredExchanges.length === 0) {
        this.logger.log('[CRON] No expired exchanges found');
        return;
      }

      this.logger.log(`[CRON] Found ${expiredExchanges.length} expired exchanges`);

      for (const exchange of expiredExchanges) {
        // Update status to CANCELLED
        exchange.status = ExchangeStatus.CANCELLED;
        exchange.cancellation_reason = 'EXPIRED';
        exchange.cancelled_at = new Date();
        await this.exchangeRepo.save(exchange);

        // Release all books back to AVAILABLE
        const bookIds = exchange.exchange_books.map(eb => eb.book_id);
        if (bookIds.length > 0) {
          await this.bookRepo.update(
            { book_id: In(bookIds) },
            { status: BookStatus.AVAILABLE }
          );
        }

        // Apply penalty to BOTH members for letting exchange expire (-5 points each)
        const EXPIRED_PENALTY = 5.0;
        await this.memberRepo.decrement(
          { member_id: exchange.member_a_id },
          'trust_score',
          EXPIRED_PENALTY
        );
        await this.memberRepo.decrement(
          { member_id: exchange.member_b_id },
          'trust_score',
          EXPIRED_PENALTY
        );

        this.logger.log(
          `[CRON] Expired exchange ${exchange.exchange_id}, ` +
          `released ${bookIds.length} books, ` +
          `penalized both members -${EXPIRED_PENALTY} trust score`
        );
      }

      this.logger.log(`[CRON] Successfully auto-cancelled ${expiredExchanges.length} expired exchanges`);
    } catch (error) {
      this.logger.error('[CRON] Error expiring exchanges:', error);
    }
  }

  // ==================== CREATE EXCHANGE REQUEST ====================
  async createExchangeRequest(userId: string, dto: CreateExchangeRequestDto) {
    this.logger.log(`[createExchangeRequest] userId=${userId}`);

    // 1. Get requester member
    const requester = await this.memberRepo.findOne({
      where: { user_id: userId },
    });

    if (!requester) {
      throw new NotFoundException('Member profile not found');
    }

    // 1.1 Check Trust Score - Block if too low (scale 0-100)
    const trustScore = Number(requester.trust_score) || 0;
    if (trustScore < 20) { // < 20 points: Cannot create exchange
      throw new ForbiddenException(
        'Điểm uy tín của bạn quá thấp để tạo yêu cầu trao đổi. ' +
        'Vui lòng liên hệ admin để được hỗ trợ hoặc cải thiện điểm uy tín bằng cách hoàn thành các giao dịch thành công.'
      );
    }

    // 2. Validate receiver exists
    const receiver = await this.memberRepo.findOne({
      where: { member_id: dto.receiver_id },
      relations: ['user'],
    });

    if (!receiver) {
      throw new NotFoundException('Receiver not found');
    }

    // 3. Cannot exchange with yourself
    if (requester.member_id === receiver.member_id) {
      throw new BadRequestException('Cannot create exchange request with yourself');
    }

    // 4. Validate offered books (must be owned by requester and available)
    const offeredBooks = await this.bookRepo.find({
      where: {
        book_id: In(dto.offered_book_ids),
        owner_id: requester.member_id,
        status: BookStatus.AVAILABLE,
        deleted_at: IsNull(),
      },
    });

    if (offeredBooks.length !== dto.offered_book_ids.length) {
      throw new BadRequestException(
        'Some offered books are not available or not owned by you',
      );
    }

    // 5. Validate requested books (must be owned by receiver and available)
    const requestedBooks = await this.bookRepo.find({
      where: {
        book_id: In(dto.requested_book_ids),
        owner_id: receiver.member_id,
        status: BookStatus.AVAILABLE,
        deleted_at: IsNull(),
      },
    });

    if (requestedBooks.length !== dto.requested_book_ids.length) {
      throw new BadRequestException(
        'Some requested books are not available or not owned by receiver',
      );
    }

    // 6. Check for duplicate pending requests
    const existingRequest = await this.requestRepo.findOne({
      where: {
        requester_id: requester.member_id,
        receiver_id: receiver.member_id,
        status: ExchangeRequestStatus.PENDING,
      },
    });

    if (existingRequest) {
      throw new ConflictException('You already have a pending request with this member');
    }

    // 6.1 Check MAX_PENDING_PER_BOOK limit (prevent spam on popular books)
    const MAX_PENDING_PER_BOOK = 3;
    for (const bookId of dto.requested_book_ids) {
      const pendingCount = await this.requestRepo
        .createQueryBuilder('request')
        .innerJoin('exchange_request_books', 'rb', 'rb.request_id = request.request_id')
        .where('rb.book_id = :bookId', { bookId })
        .andWhere('rb.book_type = :bookType', { bookType: 'REQUESTED' })
        .andWhere('request.status = :status', { status: ExchangeRequestStatus.PENDING })
        .getCount();

      if (pendingCount >= MAX_PENDING_PER_BOOK) {
        const book = requestedBooks.find(b => b.book_id === bookId);
        throw new ConflictException(
          `Sách "${book?.title || 'này'}" đã có ${MAX_PENDING_PER_BOOK} yêu cầu chờ xử lý. ` +
          `Vui lòng thử lại sau khi chủ sách xử lý các yêu cầu hiện tại.`
        );
      }
    }

    // 7. Create exchange request with expiration (14 days)
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 14); // Request expires in 14 days

    const request = this.requestRepo.create({
      request_id: uuidv4(),
      requester_id: requester.member_id,
      receiver_id: receiver.member_id,
      status: ExchangeRequestStatus.PENDING,
      message: dto.message,
      expires_at: expiresAt,
    });

    await this.requestRepo.save(request);

    // 8. Create request books (offered)
    for (const bookId of dto.offered_book_ids) {
      const requestBook = this.requestBookRepo.create({
        exchange_request_book_id: uuidv4(),
        request_id: request.request_id,
        book_id: bookId,
        offered_by_requester: true,
        book_type: BookType.OFFERED,
      });
      await this.requestBookRepo.save(requestBook);
    }

    // 9. Create request books (requested)
    for (const bookId of dto.requested_book_ids) {
      const requestBook = this.requestBookRepo.create({
        exchange_request_book_id: uuidv4(),
        request_id: request.request_id,
        book_id: bookId,
        offered_by_requester: false,
        book_type: BookType.REQUESTED,
      });
      await this.requestBookRepo.save(requestBook);
    }

    // 10. KHÔNG lock sách khi tạo request - chỉ lock khi receiver ACCEPT
    // Books remain AVAILABLE to allow other users to send requests
    // This prevents books being locked unnecessarily if request is rejected
    this.logger.log(`Exchange request created: ${request.request_id} (books remain AVAILABLE)`);

    // Log activity
    await this.activityLogService.logActivity({
      user_id: userId,
      action: UserActivityAction.CREATE_EXCHANGE_REQUEST,
      entity_type: 'EXCHANGE_REQUEST',
      entity_id: request.request_id,
      metadata: { receiver: receiver.member_id },
    });

    // Return full request details
    return this.getRequestById(request.request_id);
  }

  // ==================== GET REQUEST BY ID ====================
  async getRequestById(requestId: string) {
    const request = await this.requestRepo.findOne({
      where: { request_id: requestId },
      relations: [
        'requester',
        'requester.user',
        'receiver',
        'receiver.user',
        'request_books',
        'request_books.book',
      ],
    });

    if (!request) {
      throw new NotFoundException('Exchange request not found');
    }

    return this.formatRequestResponse(request);
  }

  // ==================== LIST MY REQUESTS ====================
  async getMyRequests(userId: string, query: QueryExchangeRequestsDto) {
    this.logger.log(`[getMyRequests] userId=${userId}, query=${JSON.stringify(query)}`);

    // Get ALL member records for this user (in case of duplicate/old records)
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);
    this.logger.log(`[getMyRequests] Found ${memberIds.length} member records: ${memberIds.join(', ')}`);

    const { status, type = 'received', page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.requestRepo
      .createQueryBuilder('request')
      .leftJoinAndSelect('request.requester', 'requester')
      .leftJoinAndSelect('requester.user', 'requester_user')
      .leftJoinAndSelect('request.receiver', 'receiver')
      .leftJoinAndSelect('receiver.user', 'receiver_user')
      .leftJoinAndSelect('request.request_books', 'request_books')
      .leftJoinAndSelect('request_books.book', 'book');

    // Filter by type (sent or received) - check ALL member records for this user
    if (type === 'sent') {
      queryBuilder.where('request.requester_id IN (:...memberIds)', {
        memberIds,
      });
    } else {
      queryBuilder.where('request.receiver_id IN (:...memberIds)', {
        memberIds,
      });
    }

    // Filter by status
    if (status) {
      queryBuilder.andWhere('request.status = :status', { status });
    }

    // Pagination
    const [requests, total] = await queryBuilder
      .orderBy('request.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    const items = requests.map((req) => this.formatRequestResponse(req));

    return {
      items,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ==================== RESPOND TO REQUEST ====================
  async respondToRequest(
    userId: string,
    requestId: string,
    dto: RespondToRequestDto,
  ) {
    this.logger.log(`[respondToRequest] requestId=${requestId}, action=${dto.action}`);

    // 1. Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    // 2. Get request
    const request = await this.requestRepo.findOne({
      where: { request_id: requestId },
      relations: ['request_books'],
    });

    if (!request) {
      throw new NotFoundException('Exchange request not found');
    }

    // 3. Verify user is the receiver (check ALL member records)
    if (!memberIds.includes(request.receiver_id)) {
      throw new ForbiddenException('You are not authorized to respond to this request');
    }

    // 4. Check request is still pending
    if (request.status !== ExchangeRequestStatus.PENDING) {
      throw new BadRequestException('Request has already been responded to');
    }

    // 4.1 Check if request has expired
    if (request.expires_at && new Date() > new Date(request.expires_at)) {
      // Auto-expire the request
      request.status = ExchangeRequestStatus.CANCELLED;
      await this.requestRepo.save(request);

      // Release books back to AVAILABLE
      const bookIds = request.request_books.map((rb) => rb.book_id);
      await this.bookRepo.update(
        { book_id: In(bookIds) },
        { status: BookStatus.AVAILABLE },
      );

      throw new BadRequestException('This request has expired. The books have been released.');
    }

    // 5. Accept or Reject
    if (dto.action === 'accept') {
      return this.acceptRequest(request);
    } else {
      return this.rejectRequest(request, dto.rejection_reason);
    }
  }

  // ==================== ACCEPT REQUEST ====================
  private async acceptRequest(request: ExchangeRequest) {
    // 1. Lock books to EXCHANGING (moved from createRequest)
    const requestBooks = await this.requestBookRepo.find({
      where: { request_id: request.request_id },
    });
    
    const bookIds = requestBooks.map(rb => rb.book_id);
    
    // Check if books are still AVAILABLE (race condition protection)
    const conflictingBooks = await this.bookRepo.find({
      where: {
        book_id: In(bookIds),
        status: Not(BookStatus.AVAILABLE)
      }
    });

    if (conflictingBooks.length > 0) {
      const conflictTitles = conflictingBooks.map(b => b.title).join(', ');
      throw new BadRequestException(
        `Some books are no longer available: ${conflictTitles}. ` +
        `They may have been accepted in another exchange.`
      );
    }

    // Lock all books involved
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.EXCHANGING }
    );
    
    this.logger.log(`Locked ${bookIds.length} books to EXCHANGING for request ${request.request_id}`);

    // 2. Update request status
    request.status = ExchangeRequestStatus.ACCEPTED;
    request.responded_at = new Date();
    await this.requestRepo.save(request);

    // 3. Create Exchange
    const exchange = this.exchangeRepo.create({
      exchange_id: uuidv4(),
      request_id: request.request_id,
      member_a_id: request.requester_id,
      member_b_id: request.receiver_id,
      status: ExchangeStatus.PENDING,
    });

    await this.exchangeRepo.save(exchange);

    // 4. Create ExchangeBooks (requestBooks already loaded above)
    for (const rb of requestBooks) {
      const exchangeBook = this.exchangeBookRepo.create({
        exchange_book_id: uuidv4(),
        exchange_id: exchange.exchange_id,
        book_id: rb.book_id,
        from_member_id: rb.offered_by_requester
          ? request.requester_id
          : request.receiver_id,
        to_member_id: rb.offered_by_requester
          ? request.receiver_id
          : request.requester_id,
      });
      await this.exchangeBookRepo.save(exchangeBook);
    }

    this.logger.log(`Exchange created: ${exchange.exchange_id}`);

    // Log activity for receiver (who accepted)
    const receiver = await this.memberRepo.findOne({
      where: { member_id: request.receiver_id },
      relations: ['user'],
    });
    
    if (receiver?.user) {
      await this.activityLogService.logActivity({
        user_id: receiver.user.user_id,
        action: UserActivityAction.ACCEPT_EXCHANGE_REQUEST,
        entity_type: 'EXCHANGE',
        entity_id: exchange.exchange_id,
        metadata: { requester: request.requester_id },
      });
    }

    // 5. Send notification to requester (their request was accepted!)
    this.logger.log(`[NOTIFICATION] Attempting to send EXCHANGE_ACCEPTED to ${request.requester_id}`);
    try {
      
      this.logger.log(`[NOTIFICATION] Receiver info: ${receiver?.user?.full_name}`);
      
      await this.notificationsService.create(
        request.requester_id,
        'EXCHANGE_ACCEPTED',
        {
          exchange_id: exchange.exchange_id,
          request_id: request.request_id,
          accepted_by: receiver?.user?.full_name || 'Someone',
          message: `${receiver?.user?.full_name || 'Someone'} đã chấp nhận yêu cầu trao đổi của bạn!`,
        },
      );
      
      this.logger.log(`[NOTIFICATION] ✅ EXCHANGE_ACCEPTED notification sent successfully`);
    } catch (err) {
      this.logger.error(`[NOTIFICATION] ❌ Failed to send EXCHANGE_ACCEPTED notification:`, err.message);
      this.logger.error(err.stack);
    }

    return this.getRequestById(request.request_id);
  }

  // ==================== REJECT REQUEST ====================
  private async rejectRequest(request: ExchangeRequest, reason?: string) {
    // 1. Update request
    request.status = ExchangeRequestStatus.REJECTED;
    request.rejection_reason = reason || '';
    request.responded_at = new Date();
    await this.requestRepo.save(request);

    // 2. Release books back to AVAILABLE
    const requestBooks = await this.requestBookRepo.find({
      where: { request_id: request.request_id },
    });

    const bookIds = requestBooks.map((rb) => rb.book_id);

    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.AVAILABLE },
    );

    this.logger.log(`Request rejected: ${request.request_id}`);

    // Log activity for receiver (who rejected)
    const receiver = await this.memberRepo.findOne({
      where: { member_id: request.receiver_id },
      relations: ['user'],
    });
    
    if (receiver?.user) {
      await this.activityLogService.logActivity({
        user_id: receiver.user.user_id,
        action: UserActivityAction.REJECT_EXCHANGE_REQUEST,
        entity_type: 'EXCHANGE_REQUEST',
        entity_id: request.request_id,
        metadata: { reason: reason || 'No reason provided' },
      });
    }

    // 3. Send notification to requester (their request was rejected)
    try {
      
      await this.notificationsService.create(
        request.requester_id,
        'EXCHANGE_REJECTED',
        {
          request_id: request.request_id,
          rejected_by: receiver?.user?.full_name || 'Someone',
          reason: reason || 'Không có lý do',
          message: `${receiver?.user?.full_name || 'Someone'} đã từ chối yêu cầu trao đổi của bạn`,
        },
      );
    } catch (err) {
      this.logger.warn('Failed to send EXCHANGE_REJECTED notification:', err.message);
    }

    return this.getRequestById(request.request_id);
  }

  // ==================== CANCEL REQUEST ====================
  async cancelRequest(userId: string, requestId: string) {
    this.logger.log(`[cancelRequest] requestId=${requestId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const request = await this.requestRepo.findOne({
      where: { request_id: requestId },
      relations: ['request_books'],
    });

    if (!request) {
      throw new NotFoundException('Request not found');
    }

    // Only requester can cancel (check ALL member records)
    if (!memberIds.includes(request.requester_id)) {
      throw new ForbiddenException('Only the requester can cancel the request');
    }

    // Can only cancel pending requests
    if (request.status !== ExchangeRequestStatus.PENDING) {
      throw new BadRequestException('Cannot cancel a request that is not pending');
    }

    // Update status
    request.status = ExchangeRequestStatus.CANCELLED;
    await this.requestRepo.save(request);

    // Release books
    const bookIds = request.request_books.map((rb) => rb.book_id);
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.AVAILABLE },
    );

    return { message: 'Exchange request cancelled successfully' };
  }

  // ==================== GET MY EXCHANGES ====================
  async getMyExchanges(userId: string, query: QueryExchangesDto) {
    this.logger.log(`[getMyExchanges] userId=${userId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const { status, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const queryBuilder = this.exchangeRepo
      .createQueryBuilder('exchange')
      .leftJoinAndSelect('exchange.member_a', 'member_a')
      .leftJoinAndSelect('member_a.user', 'user_a')
      .leftJoinAndSelect('exchange.member_b', 'member_b')
      .leftJoinAndSelect('member_b.user', 'user_b')
      .leftJoinAndSelect('exchange.exchange_books', 'exchange_books')
      .leftJoinAndSelect('exchange_books.book', 'book')
      .where('exchange.member_a_id IN (:...memberIds)', { memberIds })
      .orWhere('exchange.member_b_id IN (:...memberIds)', { memberIds });

    if (status) {
      queryBuilder.andWhere('exchange.status = :status', { status });
    }

    const [exchanges, total] = await queryBuilder
      .orderBy('exchange.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      items: exchanges.map((ex) => this.formatExchangeResponse(ex)),
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    };
  }

  // ==================== CONFIRM EXCHANGE COMPLETION ====================
  async confirmExchange(userId: string, exchangeId: string) {
    this.logger.log(`[confirmExchange] exchangeId=${exchangeId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Can only confirm exchanges that are IN_PROGRESS or MEETING_SCHEDULED
    if (![ExchangeStatus.IN_PROGRESS, ExchangeStatus.MEETING_SCHEDULED, ExchangeStatus.PENDING].includes(exchange.status)) {
      throw new BadRequestException('Can only confirm exchanges that are in progress');
    }

    // Verify user is part of exchange (check ALL member records)
    let isPartOfExchange = false;
    let userIsMemberA = false;

    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = true;
        break;
      }
      if (exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = false;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Update confirmation
    if (userIsMemberA) {
      exchange.member_a_confirmed = true;
      exchange.confirmed_by_a_at = new Date();
    } else {
      exchange.member_b_confirmed = true;
      exchange.confirmed_by_b_at = new Date();
    }

    // If both confirmed, mark as completed
    if (exchange.member_a_confirmed && exchange.member_b_confirmed) {
      exchange.status = ExchangeStatus.COMPLETED;
      exchange.completed_at = new Date();

      // Transfer book ownership
      const exchangeBooks = await this.exchangeBookRepo.find({
        where: { exchange_id: exchangeId },
      });

      for (const eb of exchangeBooks) {
        // Update owner_id from 'from' member to 'to' member
        await this.bookRepo.update(
          { book_id: eb.book_id },
          {
            owner_id: eb.to_member_id,
            status: BookStatus.AVAILABLE,
            deleted_at: () => 'NULL'  // Clear deleted_at to restore book
          }
        );
      }

      this.logger.log(`Transferred ownership of ${exchangeBooks.length} books for exchange ${exchangeId}`);

      // Update member stats
      await this.memberRepo.increment(
        { member_id: exchange.member_a_id },
        'completed_exchanges',
        1,
      );
      await this.memberRepo.increment(
        { member_id: exchange.member_b_id },
        'completed_exchanges',
        1,
      );

      // Award +2.0 trust score for completing exchange
      await this.memberRepo.increment(
        { member_id: exchange.member_a_id },
        'trust_score',
        2.0,
      );
      await this.memberRepo.increment(
        { member_id: exchange.member_b_id },
        'trust_score',
        2.0,
      );
      this.logger.log(`Awarded +2.0 trust score to both members for completing exchange ${exchangeId}`);
      
      // Send completion notifications to both members
      try {
        await this.notificationsService.createMany([
          {
            memberId: exchange.member_a_id,
            type: 'EXCHANGE_COMPLETED',
            payload: {
              exchange_id: exchangeId,
              trust_score_bonus: 2.0,
              message: '🎉 Giao dịch trao đổi hoàn tất! Bạn nhận +2.0 điểm tin cậy',
            },
          },
          {
            memberId: exchange.member_b_id,
            type: 'EXCHANGE_COMPLETED',
            payload: {
              exchange_id: exchangeId,
              trust_score_bonus: 2.0,
              message: '🎉 Giao dịch trao đổi hoàn tất! Bạn nhận +2.0 điểm tin cậy',
            },
          },
        ]);
      } catch (err) {
        this.logger.warn('Failed to send EXCHANGE_COMPLETED notifications:', err.message);
      }
    } else {
      // Only one person confirmed, notify the other
      try {
        const otherMemberId = userIsMemberA ? exchange.member_b_id : exchange.member_a_id;
        const confirmer = await this.memberRepo.findOne({
          where: { member_id: userIsMemberA ? exchange.member_a_id : exchange.member_b_id },
          relations: ['user'],
        });
        
        await this.notificationsService.create(
          otherMemberId,
          'EXCHANGE_CONFIRMATION_PENDING',
          {
            exchange_id: exchangeId,
            confirmed_by: confirmer?.user?.full_name || 'Someone',
            message: `${confirmer?.user?.full_name || 'Someone'} đã xác nhận hoàn tất. Vui lòng xác nhận!`,
          },
        );
      } catch (err) {
        this.logger.warn('Failed to send EXCHANGE_CONFIRMATION_PENDING notification:', err.message);
      }
    }

    await this.exchangeRepo.save(exchange);

    return this.getExchangeById(exchangeId);
  }

  // ==================== GET EXCHANGE BY ID ====================
  async getExchangeById(exchangeId: string) {
    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
      relations: [
        'member_a',
        'member_a.user',
        'member_b',
        'member_b.user',
        'exchange_books',
        'exchange_books.book',
      ],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    return this.formatExchangeResponse(exchange);
  }

  // ==================== GET EXCHANGE STATS ====================
  async getExchangeStats(userId: string) {
    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);
    let completedExchanges = 0;

    // Sum completed_exchanges from all member records
    for (const member of members) {
      completedExchanges += member.completed_exchanges || 0;
    }

    const totalSent = await this.requestRepo.count({
      where: { requester_id: memberIds.length === 1 ? memberIds[0] : undefined },
    });

    const totalReceived = await this.requestRepo.count({
      where: { receiver_id: memberIds.length === 1 ? memberIds[0] : undefined },
    });

    // For multiple member IDs, use query builder instead of count()
    const requestRepo = this.requestRepo;
    let sentCount = 0;
    let receivedCount = 0;

    for (const memberId of memberIds) {
      sentCount += await requestRepo.count({ where: { requester_id: memberId } });
      receivedCount += await requestRepo.count({ where: { receiver_id: memberId } });
    }

    let pendingCount = 0;
    for (const memberId of memberIds) {
      pendingCount += await requestRepo.count({
        where: [
          { requester_id: memberId, status: ExchangeRequestStatus.PENDING },
          { receiver_id: memberId, status: ExchangeRequestStatus.PENDING },
        ],
      });
    }

    let activeCount = 0;
    for (const memberId of memberIds) {
      activeCount += await this.exchangeRepo.count({
        where: [
          { member_a_id: memberId, status: ExchangeStatus.PENDING },
          { member_b_id: memberId, status: ExchangeStatus.PENDING },
        ],
      });
    }

    const successRate = sentCount > 0 ? (completedExchanges / sentCount) * 100 : 0;

    return {
      total_requests_sent: sentCount,
      total_requests_received: receivedCount,
      pending_requests: pendingCount,
      active_exchanges: activeCount,
      completed_exchanges: completedExchanges,
      success_rate: Math.round(successRate * 10) / 10,
    };
  }

  // ==================== HELPER METHODS ====================
  private formatRequestResponse(request: ExchangeRequest) {
    const offeredBooks = request.request_books
      .filter((rb) => rb.book_type === BookType.OFFERED)
      .map((rb) => ({
        book_id: rb.book.book_id,
        title: rb.book.title,
        author: rb.book.author,
        condition: rb.book.book_condition,
      }));

    const requestedBooks = request.request_books
      .filter((rb) => rb.book_type === BookType.REQUESTED)
      .map((rb) => ({
        book_id: rb.book.book_id,
        title: rb.book.title,
        author: rb.book.author,
        condition: rb.book.book_condition,
      }));

    return {
      request_id: request.request_id,
      requester: {
        member_id: request.requester.member_id,
        full_name: request.requester.user.full_name,
        avatar_url: request.requester.user.avatar_url,
        region: request.requester.region,
        trust_score: request.requester.trust_score,
      },
      receiver: {
        member_id: request.receiver.member_id,
        full_name: request.receiver.user.full_name,
        avatar_url: request.receiver.user.avatar_url,
        region: request.receiver.region,
        trust_score: request.receiver.trust_score,
      },
      status: request.status,
      offered_books: offeredBooks,
      requested_books: requestedBooks,
      message: request.message,
      rejection_reason: request.rejection_reason,
      created_at: request.created_at,
      responded_at: request.responded_at,
      expires_at: request.expires_at, // Add expiration date
      is_expired: request.expires_at ? new Date() > new Date(request.expires_at) : false,
    };
  }

  // ==================== SCHEDULE MEETING ====================
  async scheduleMeeting(
    userId: string,
    exchangeId: string,
    dto: any, // ScheduleMeetingDto
  ) {
    this.logger.log(`[scheduleMeeting] exchangeId=${exchangeId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);
    const currentMemberId = members[0].member_id;

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    let userIsMemberA = false;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = true;
        break;
      }
      if (exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = false;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Can only schedule meeting for PENDING exchanges
    if (exchange.status !== ExchangeStatus.PENDING) {
      throw new BadRequestException('Can only schedule meeting for pending exchanges');
    }

    // Validate meeting time is in the future
    const meetingTime = new Date(dto.meeting_time);
    if (meetingTime <= new Date()) {
      throw new BadRequestException('Meeting time must be in the future');
    }

    // Update exchange with meeting details
    exchange.meeting_location = dto.meeting_location;
    exchange.meeting_time = meetingTime;
    exchange.meeting_notes = dto.meeting_notes || null;
    exchange.meeting_latitude = dto.meeting_latitude || null;
    exchange.meeting_longitude = dto.meeting_longitude || null;
    exchange.meeting_scheduled_at = new Date();
    exchange.meeting_scheduled_by = currentMemberId;

    // The person who schedules automatically confirms
    if (userIsMemberA) {
      exchange.meeting_confirmed_by_a = true;
    } else {
      exchange.meeting_confirmed_by_b = true;
    }

    // Status changes to MEETING_SCHEDULED once both confirm
    // For now, it stays PENDING until the other person confirms

    await this.exchangeRepo.save(exchange);

    this.logger.log(`Meeting scheduled for exchange: ${exchangeId}`);

    // Send notification to the other member
    try {
      const otherMemberId = userIsMemberA ? exchange.member_b_id : exchange.member_a_id;
      const scheduler = await this.memberRepo.findOne({
        where: { member_id: currentMemberId },
        relations: ['user'],
      });
      
      await this.notificationsService.create(
        otherMemberId,
        'MEETING_SCHEDULED',
        {
          exchange_id: exchangeId,
          scheduled_by: scheduler?.user?.full_name || 'Someone',
          meeting_time: meetingTime.toISOString(),
          message: `${scheduler?.user?.full_name || 'Someone'} đã đề xuất lịch hẹn. Vui lòng xác nhận!`,
        },
      );
    } catch (err) {
      this.logger.warn('Failed to send MEETING_SCHEDULED notification:', err.message);
    }

    return this.getExchangeById(exchangeId);
  }

  // ==================== CONFIRM MEETING ====================
  async confirmMeeting(userId: string, exchangeId: string) {
    this.logger.log(`[confirmMeeting] exchangeId=${exchangeId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    let userIsMemberA = false;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = true;
        break;
      }
      if (exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = false;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Must have meeting scheduled first
    if (!exchange.meeting_time || !exchange.meeting_location) {
      throw new BadRequestException('No meeting has been scheduled yet');
    }

    // Update confirmation
    if (userIsMemberA) {
      exchange.meeting_confirmed_by_a = true;
    } else {
      exchange.meeting_confirmed_by_b = true;
    }

    // If both confirmed, update status to MEETING_SCHEDULED
    if (exchange.meeting_confirmed_by_a && exchange.meeting_confirmed_by_b) {
      exchange.status = ExchangeStatus.MEETING_SCHEDULED;
      this.logger.log(`Meeting confirmed by both parties for exchange: ${exchangeId}`);
      
      // Send notifications to both members
      try {
        await this.notificationsService.createMany([
          {
            memberId: exchange.member_a_id,
            type: 'MEETING_CONFIRMED',
            payload: {
              exchange_id: exchangeId,
              meeting_time: exchange.meeting_time,
              message: '🎉 Cả hai bên đã xác nhận cuộc hẹn!',
            },
          },
          {
            memberId: exchange.member_b_id,
            type: 'MEETING_CONFIRMED',
            payload: {
              exchange_id: exchangeId,
              meeting_time: exchange.meeting_time,
              message: '🎉 Cả hai bên đã xác nhận cuộc hẹn!',
            },
          },
        ]);
      } catch (err) {
        this.logger.warn('Failed to send MEETING_CONFIRMED notifications:', err.message);
      }
    } else {
      // Only one person confirmed, notify the other
      try {
        const otherMemberId = userIsMemberA ? exchange.member_b_id : exchange.member_a_id;
        const confirmer = await this.memberRepo.findOne({
          where: { member_id: userIsMemberA ? exchange.member_a_id : exchange.member_b_id },
          relations: ['user'],
        });
        
        await this.notificationsService.create(
          otherMemberId,
          'MEETING_CONFIRMATION_PENDING',
          {
            exchange_id: exchangeId,
            confirmed_by: confirmer?.user?.full_name || 'Someone',
            meeting_time: exchange.meeting_time,
            message: `${confirmer?.user?.full_name || 'Someone'} đã xác nhận cuộc hẹn. Vui lòng xác nhận!`,
          },
        );
      } catch (err) {
        this.logger.warn('Failed to send MEETING_CONFIRMATION_PENDING notification:', err.message);
      }
    }

    await this.exchangeRepo.save(exchange);

    return this.getExchangeById(exchangeId);
  }

  // ==================== START EXCHANGE (After meeting) ====================
  async startExchange(userId: string, exchangeId: string) {
    this.logger.log(`[startExchange] exchangeId=${exchangeId}`);

    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId || exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Can only start from MEETING_SCHEDULED status
    if (exchange.status !== ExchangeStatus.MEETING_SCHEDULED) {
      throw new BadRequestException('Can only start exchange after meeting is scheduled and confirmed');
    }

    exchange.status = ExchangeStatus.IN_PROGRESS;
    await this.exchangeRepo.save(exchange);

    this.logger.log(`Exchange started: ${exchangeId}`);

    return this.getExchangeById(exchangeId);
  }

  // ==================== UPDATE MEETING INFO ====================
  async updateMeetingInfo(
    userId: string,
    exchangeId: string,
    dto: any, // UpdateMeetingInfoDto
  ) {
    this.logger.log(`[updateMeetingInfo] exchangeId=${exchangeId}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);
    const currentMemberId = members[0].member_id;

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    let userIsMemberA = false;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = true;
        break;
      }
      if (exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        userIsMemberA = false;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Can only update meeting info for PENDING or MEETING_SCHEDULED exchanges
    if (![ExchangeStatus.PENDING, ExchangeStatus.MEETING_SCHEDULED].includes(exchange.status)) {
      throw new BadRequestException('Cannot update meeting info for this exchange status');
    }

    // Update meeting info
    if (dto.meeting_location !== undefined) {
      exchange.meeting_location = dto.meeting_location;
    }
    if (dto.meeting_time !== undefined) {
      if (dto.meeting_time) {
        exchange.meeting_time = new Date(dto.meeting_time);
      } else {
        exchange.meeting_time = null as any;
      }
    }
    if (dto.meeting_notes !== undefined) {
      exchange.meeting_notes = dto.meeting_notes;
    }
    if (dto.meeting_latitude !== undefined) {
      exchange.meeting_latitude = dto.meeting_latitude;
    }
    if (dto.meeting_longitude !== undefined) {
      exchange.meeting_longitude = dto.meeting_longitude;
    }

    // Reset confirmations when meeting is updated (other person needs to re-confirm)
    if (dto.meeting_location || dto.meeting_time) {
      if (userIsMemberA) {
        exchange.meeting_confirmed_by_a = true;
        exchange.meeting_confirmed_by_b = false;
      } else {
        exchange.meeting_confirmed_by_a = false;
        exchange.meeting_confirmed_by_b = true;
      }
      exchange.meeting_scheduled_by = currentMemberId;
      exchange.meeting_scheduled_at = new Date();

      // If status was MEETING_SCHEDULED, revert to PENDING
      if (exchange.status === ExchangeStatus.MEETING_SCHEDULED) {
        exchange.status = ExchangeStatus.PENDING;
      }
    }

    await this.exchangeRepo.save(exchange);

    return this.getExchangeById(exchangeId);
  }

  // ==================== CANCEL EXCHANGE ====================
  async cancelExchange(
    userId: string,
    exchangeId: string,
    dto: any, // CancelExchangeDto
  ) {
    this.logger.log(`[cancelExchange] exchangeId=${exchangeId} reason=${dto.cancellation_reason}`);

    // Get ALL member records for user
    const members = await this.memberRepo.find({
      where: { user_id: userId },
    });

    if (!members || members.length === 0) {
      throw new NotFoundException('Member profile not found');
    }

    const memberIds = members.map((m) => m.member_id);

    const exchange = await this.exchangeRepo.findOne({
      where: { exchange_id: exchangeId },
      relations: ['exchange_books', 'exchange_books.book'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId || exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        break;
      }
    }

    if (!isPartOfExchange) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Cannot cancel completed exchanges
    if (exchange.status === ExchangeStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed exchange');
    }

    // Determine which member is cancelling
    let cancellingMemberId: string | null = null;
    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId || exchange.member_b_id === memberId) {
        cancellingMemberId = memberId;
        break;
      }
    }

    // Update exchange status
    exchange.status = ExchangeStatus.CANCELLED;
    exchange.cancellation_reason = dto.cancellation_reason;
    exchange.cancellation_details = dto.cancellation_details || null;
    if (cancellingMemberId) {
      exchange.cancelled_by = cancellingMemberId; // Track who cancelled
    }

    await this.exchangeRepo.save(exchange);

    // Release books back to AVAILABLE
    const bookIds = exchange.exchange_books.map((eb) => eb.book_id);
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.AVAILABLE },
    );

    // Only increment cancelled_exchanges for the person who cancelled
    if (cancellingMemberId) {
      await this.memberRepo.increment(
        { member_id: cancellingMemberId },
        'cancelled_exchanges',
        1,
      );
    }

    // Decrease trust score ONLY for the person who cancelled (except ADMIN_CANCELLED)
    if (dto.cancellation_reason !== 'ADMIN_CANCELLED' && cancellingMemberId) {
      const penaltyPoints = this.getCancellationPenalty(dto.cancellation_reason);

      await this.memberRepo.decrement(
        { member_id: cancellingMemberId },
        'trust_score',
        penaltyPoints,
      );

      this.logger.log(`Trust score decreased by ${penaltyPoints} for member ${cancellingMemberId} due to cancellation`);
    }

    this.logger.log(`Exchange cancelled: ${exchange.exchange_id}`);

    // Send notification to the other member
    try {
      const otherMemberId = cancellingMemberId === exchange.member_a_id 
        ? exchange.member_b_id 
        : exchange.member_a_id;
        
      const canceller = await this.memberRepo.findOne({
        where: { member_id: cancellingMemberId! },
        relations: ['user'],
      });
      
      await this.notificationsService.create(
        otherMemberId,
        'EXCHANGE_CANCELLED',
        {
          exchange_id: exchangeId,
          cancelled_by: canceller?.user?.full_name || 'Someone',
          reason: dto.cancellation_reason,
          details: dto.cancellation_details,
          message: `${canceller?.user?.full_name || 'Someone'} đã hủy giao dịch trao đổi`,
        },
      );
    } catch (err) {
      this.logger.warn('Failed to send EXCHANGE_CANCELLED notification:', err.message);
    }

    return this.getExchangeById(exchangeId);
  }

  // ==================== GET CANCELLATION PENALTY ====================
  private getCancellationPenalty(reason: string): number {
    const penalties = {
      USER_CANCELLED: 2,
      NO_SHOW: 5,
      BOTH_NO_SHOW: 5,
      DISPUTE: 3,
      ADMIN_CANCELLED: 0,
    };
    return penalties[reason] || 2;
  }

  // ==================== GET PUBLIC MEMBER EXCHANGE HISTORY ====================
  /**
   * Get completed exchanges for a member (public - for profile view)
   * Only shows completed exchanges with limited info
   */
  async getMemberPublicExchangeHistory(memberId: string, limit = 10) {
    this.logger.log(`[getMemberPublicExchangeHistory] memberId=${memberId} limit=${limit}`);

    // Get completed exchanges where member participated
    const exchanges = await this.exchangeRepo.find({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.COMPLETED },
        { member_b_id: memberId, status: ExchangeStatus.COMPLETED },
      ],
      relations: [
        'member_a',
        'member_a.user',
        'member_b',
        'member_b.user',
        'exchange_books',
        'exchange_books.book',
      ],
      order: { completed_at: 'DESC' },
      take: limit,
    });

    // Get total count
    const totalCompleted = await this.exchangeRepo.count({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.COMPLETED },
        { member_b_id: memberId, status: ExchangeStatus.COMPLETED },
      ],
    });

    return {
      exchanges: exchanges.map((e) => this.formatPublicExchangeResponse(e, memberId)),
      total_completed: totalCompleted,
      shown: exchanges.length,
    };
  }

  /**
   * Format exchange for public view (limited info)
   */
  private formatPublicExchangeResponse(exchange: Exchange, viewerMemberId: string) {
    // Determine if this member was member_a or member_b
    const isPartnerMemberA = exchange.member_a_id !== viewerMemberId;
    const partner = isPartnerMemberA ? exchange.member_a : exchange.member_b;

    // Get books exchanged
    const booksReceived = exchange.exchange_books
      .filter((eb) => eb.to_member_id === viewerMemberId)
      .map((eb) => ({
        title: eb.book.title,
        author: eb.book.author,
      }));

    const booksGiven = exchange.exchange_books
      .filter((eb) => eb.from_member_id === viewerMemberId)
      .map((eb) => ({
        title: eb.book.title,
        author: eb.book.author,
      }));

    return {
      exchange_id: exchange.exchange_id,
      completed_at: exchange.completed_at,
      partner: {
        member_id: partner.member_id,
        full_name: partner.user?.full_name || 'Thành viên',
        avatar_url: partner.user?.avatar_url,
      },
      books_received: booksReceived,
      books_given: booksGiven,
    };
  }

  private formatExchangeResponse(exchange: Exchange) {
    return {
      exchange_id: exchange.exchange_id,
      status: exchange.status,
      member_a: {
        member_id: exchange.member_a.member_id,
        full_name: exchange.member_a.user.full_name,
        avatar_url: exchange.member_a.user.avatar_url,
      },
      member_b: {
        member_id: exchange.member_b.member_id,
        full_name: exchange.member_b.user.full_name,
        avatar_url: exchange.member_b.user.avatar_url,
      },
      books: exchange.exchange_books.map((eb) => ({
        book_id: eb.book.book_id,
        title: eb.book.title,
        from: eb.from_member_id,
        to: eb.to_member_id,
      })),
      member_a_confirmed: exchange.member_a_confirmed,
      member_b_confirmed: exchange.member_b_confirmed,
      // Meeting info
      meeting: {
        location: exchange.meeting_location,
        latitude: exchange.meeting_latitude,
        longitude: exchange.meeting_longitude,
        time: exchange.meeting_time,
        notes: exchange.meeting_notes,
        scheduled_at: exchange.meeting_scheduled_at,
        scheduled_by: exchange.meeting_scheduled_by,
        confirmed_by_a: exchange.meeting_confirmed_by_a,
        confirmed_by_b: exchange.meeting_confirmed_by_b,
        is_confirmed: exchange.meeting_confirmed_by_a && exchange.meeting_confirmed_by_b,
      },
      // Legacy fields for backward compatibility
      meeting_location: exchange.meeting_location,
      meeting_time: exchange.meeting_time,
      meeting_notes: exchange.meeting_notes,
      cancellation_reason: exchange.cancellation_reason,
      cancellation_details: exchange.cancellation_details,
      completed_at: exchange.completed_at,
      created_at: exchange.created_at,
    };
  }
}