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
import { Repository, In, IsNull, LessThan } from 'typeorm';
import { Cron, CronExpression } from '@nestjs/schedule';
import { v4 as uuidv4 } from 'uuid';
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
  CancellationReason,
} from '../../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../../infrastructure/database/entities/exchange-book.entity';
import {
  CreateExchangeRequestDto,
  RespondToRequestDto,
  QueryExchangeRequestsDto,
  QueryExchangesDto,
  CancelExchangeDto,
  UpdateMeetingDto,
} from '../dto/exchange.dto';
import { TrustScoreService } from '../../../common/services/trust-score.service';

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

    private trustScoreService: TrustScoreService,
  ) {}

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

    // 4. Check trust score restrictions
    const MIN_TRUST_SCORE = 10; // Users with score < 10 cannot create requests
    const LOW_TRUST_SCORE = 20; // Users with score < 20 have limits
    
    if (requester.trust_score < MIN_TRUST_SCORE) {
      throw new ForbiddenException(
        `Your trust score (${requester.trust_score}) is too low to create exchange requests. ` +
        `Minimum required: ${MIN_TRUST_SCORE}. Complete exchanges successfully to improve your score.`
      );
    }

    if (requester.trust_score < LOW_TRUST_SCORE) {
      // Count pending/active requests for low-trust users
      const pendingCount = await this.requestRepo.count({
        where: {
          requester_id: requester.member_id,
          status: ExchangeRequestStatus.PENDING,
        },
      });

      const MAX_PENDING_LOW_TRUST = 2;
      if (pendingCount >= MAX_PENDING_LOW_TRUST) {
        throw new ForbiddenException(
          `Your trust score (${requester.trust_score}) limits you to ${MAX_PENDING_LOW_TRUST} pending requests at a time. ` +
          `Wait for responses or improve your trust score by completing exchanges successfully.`
        );
      }
    }

    // 5. Validate offered books (must be owned by requester and available)
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

    // 7. Create exchange request
    const request = this.requestRepo.create({
      request_id: uuidv4(),
      requester_id: requester.member_id,
      receiver_id: receiver.member_id,
      status: ExchangeRequestStatus.PENDING,
      message: dto.message,
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

    // 10. Books stay AVAILABLE until request is accepted
    // No status change here to allow multiple pending requests

    this.logger.log(`Exchange request created: ${request.request_id}`);

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

    // Trust score-based sorting: High trust users' requests appear first
    // This gives priority visibility to reliable users
    if (type === 'received') {
      queryBuilder.orderBy('requester.trust_score', 'DESC');
      queryBuilder.addOrderBy('request.created_at', 'DESC');
    } else {
      queryBuilder.orderBy('request.created_at', 'DESC');
    }

    // Pagination
    const [requests, total] = await queryBuilder
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

    // 5. Accept or Reject
    if (dto.action === 'accept') {
      return this.acceptRequest(request);
    } else {
      return this.rejectRequest(request, dto.rejection_reason);
    }
  }

  // ==================== ACCEPT REQUEST ====================
  private async acceptRequest(request: ExchangeRequest) {
    // 0. Check receiver's trust score for response time limit
    const receiver = await this.memberRepo.findOne({
      where: { member_id: request.receiver_id },
    });

    if (receiver && receiver.trust_score < 20) {
      // Low trust users must respond within 24 hours
      const requestAge = Date.now() - request.created_at.getTime();
      const maxResponseTime = 24 * 60 * 60 * 1000; // 24 hours
      
      if (requestAge > maxResponseTime) {
        throw new BadRequestException(
          `Users with trust score < 20 must respond within 24 hours. ` +
          `This request is ${Math.floor(requestAge / (60 * 60 * 1000))} hours old.`
        );
      }
    }

    // 1. Get all books involved in this request
    const requestBooks = await this.requestBookRepo.find({
      where: { request_id: request.request_id },
    });
    const bookIds = requestBooks.map((rb) => rb.book_id);

    // 2. Check if any books are already in PENDING or ACCEPTED exchanges
    const conflictingExchanges = await this.exchangeBookRepo
      .createQueryBuilder('eb')
      .innerJoin('eb.exchange', 'e')
      .where('eb.book_id IN (:...bookIds)', { bookIds })
      .andWhere('e.status IN (:...statuses)', {
        statuses: [ExchangeStatus.PENDING, ExchangeStatus.ACCEPTED],
      })
      .getMany();

    if (conflictingExchanges.length > 0) {
      // Books are locked in another exchange
      const conflictingBookIds = [...new Set(conflictingExchanges.map(eb => eb.book_id))];
      const conflictingBooks = await this.bookRepo.find({
        where: { book_id: In(conflictingBookIds) },
      });
      const bookTitles = conflictingBooks.map(b => b.title).join(', ');
      
      throw new ConflictException(
        `Cannot accept request: The following books are already in an active exchange: ${bookTitles}`,
      );
    }

    // 3. Update request status
    request.status = ExchangeRequestStatus.ACCEPTED;
    request.responded_at = new Date();
    await this.requestRepo.save(request);

    // 4. Update book status to EXCHANGING (lock the books)
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.EXCHANGING },
    );

    // 5. Auto-reject all other PENDING requests containing these books
    const conflictingRequests = await this.requestBookRepo
      .createQueryBuilder('rb')
      .innerJoin('rb.request', 'r')
      .where('rb.book_id IN (:...bookIds)', { bookIds })
      .andWhere('r.status = :status', { status: ExchangeRequestStatus.PENDING })
      .andWhere('r.request_id != :currentRequestId', { currentRequestId: request.request_id })
      .select('r.request_id')
      .distinct(true)
      .getRawMany();

    if (conflictingRequests.length > 0) {
      const conflictingRequestIds = conflictingRequests.map(r => r.r_request_id);
      await this.requestRepo.update(
        { request_id: In(conflictingRequestIds) },
        {
          status: ExchangeRequestStatus.REJECTED,
          rejection_reason: 'Books no longer available - already in another exchange',
          responded_at: new Date(),
        },
      );
      this.logger.log(
        `Auto-rejected ${conflictingRequestIds.length} conflicting requests: ${conflictingRequestIds.join(', ')}`,
      );
    }

    // 6. Calculate exchange expiry based on trust scores
    const requester = await this.memberRepo.findOne({
      where: { member_id: request.requester_id },
    });

    // Lower trust = shorter expiry time (pressure to complete quickly)
    const minTrustScore = Math.min(
      requester?.trust_score || 50,
      receiver?.trust_score || 50
    );
    
    let expiryDays = 14; // Default 14 days for high trust users
    if (minTrustScore < 20) {
      expiryDays = 3; // Low trust: only 3 days to confirm
      this.logger.warn(`Low trust exchange: ${expiryDays} days expiry (min score: ${minTrustScore})`);
    } else if (minTrustScore < 40) {
      expiryDays = 7; // Medium trust: 7 days
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiryDays);

    const exchange = this.exchangeRepo.create({
      exchange_id: uuidv4(),
      request_id: request.request_id,
      member_a_id: request.requester_id,
      member_b_id: request.receiver_id,
      status: ExchangeStatus.PENDING,
      expires_at: expiresAt,
    });

    await this.exchangeRepo.save(exchange);
    
    this.logger.log(
      `Exchange created: ${exchange.exchange_id}, expires at ${expiresAt.toISOString()}`,
    );

    // 7. Create ExchangeBooks (reuse requestBooks from step 1)
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

    return this.getRequestById(request.request_id);
  }

  // ==================== REJECT REQUEST ====================
  private async rejectRequest(request: ExchangeRequest, reason?: string) {
    // 1. Update request
    request.status = ExchangeRequestStatus.REJECTED;
    request.rejection_reason = reason || '';
    request.responded_at = new Date();
    await this.requestRepo.save(request);

    // 2. No need to release books - they were never locked during PENDING status
    // Books only get locked when request is ACCEPTED

    this.logger.log(`Request rejected: ${request.request_id}`);

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

    // No need to release books - they were never locked during PENDING status
    // Books only lock when request is ACCEPTED (creating an Exchange)

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

      this.logger.log(
        `[confirmExchange] Transferring ${exchangeBooks.length} books for exchange ${exchangeId}`,
      );

      for (const eb of exchangeBooks) {
        this.logger.log(
          `[confirmExchange] Book ${eb.book_id}: ${eb.from_member_id} → ${eb.to_member_id}`,
        );
        
        await this.bookRepo.update(
          { book_id: eb.book_id },
          {
            owner_id: eb.to_member_id,
            status: BookStatus.AVAILABLE,
          },
        );
      }

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

      this.logger.log(`[confirmExchange] Exchange ${exchangeId} completed successfully`);
    }

    // Save exchange FIRST to ensure status is COMPLETED in database
    await this.exchangeRepo.save(exchange);

    // THEN update trust scores (queries will see the completed exchange)
    if (exchange.status === ExchangeStatus.COMPLETED) {
      this.logger.log('[confirmExchange] Updating trust scores after completion');
      await this.trustScoreService.updateTrustScore(exchange.member_a_id);
      await this.trustScoreService.updateTrustScore(exchange.member_b_id);
    }

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
    };
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

    // Can only update meeting info for PENDING or ACCEPTED exchanges
    if (![ExchangeStatus.PENDING, 'ACCEPTED'].includes(exchange.status as any)) {
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

    // Update exchange status
    exchange.status = ExchangeStatus.CANCELLED;
    exchange.cancellation_reason = dto.cancellation_reason;
    exchange.cancellation_details = dto.cancellation_details || null;

    await this.exchangeRepo.save(exchange);

    // Release books back to AVAILABLE
    const bookIds = exchange.exchange_books.map((eb) => eb.book_id);
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.AVAILABLE },
    );

    // Update member stats for cancellations (trust score impact)
    await this.memberRepo.increment(
      { member_id: exchange.member_a_id },
      'cancelled_exchanges',
      1,
    );
    await this.memberRepo.increment(
      { member_id: exchange.member_b_id },
      'cancelled_exchanges',
      1,
    );

    // Decrease trust score for cancellations (except ADMIN_CANCELLED)
    if (dto.cancellation_reason !== 'ADMIN_CANCELLED') {
      const penaltyPoints = this.getCancellationPenalty(dto.cancellation_reason);
      
      await this.memberRepo.decrement(
        { member_id: exchange.member_a_id },
        'trust_score',
        penaltyPoints,
      );
      await this.memberRepo.decrement(
        { member_id: exchange.member_b_id },
        'trust_score',
        penaltyPoints,
      );
    }

    this.logger.log(`Exchange cancelled: ${exchange.exchange_id}`);

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
      meeting_location: exchange.meeting_location,
      meeting_time: exchange.meeting_time,
      meeting_notes: exchange.meeting_notes,
      cancellation_reason: exchange.cancellation_reason,
      cancellation_details: exchange.cancellation_details,
      completed_at: exchange.completed_at,
      cancelled_at: exchange.cancelled_at,
      cancelled_by: exchange.cancelled_by,
      cancellation_reason: exchange.cancellation_reason,
      expires_at: exchange.expires_at,
      meeting_location: exchange.meeting_location,
      meeting_time: exchange.meeting_time,
      meeting_notes: exchange.meeting_notes,
      meeting_updated_by: exchange.meeting_updated_by,
      meeting_updated_at: exchange.meeting_updated_at,
      created_at: exchange.created_at,
    };
  }

  // ==================== CANCEL EXCHANGE ====================
  async cancelExchange(userId: string, exchangeId: string, dto: CancelExchangeDto) {
    this.logger.log(`[cancelExchange] exchangeId=${exchangeId} userId=${userId}`);

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
      relations: ['exchange_books'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    let cancellingMemberId: string | undefined;

    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId || exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        cancellingMemberId = memberId;
        break;
      }
    }

    if (!isPartOfExchange || !cancellingMemberId) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Can only cancel PENDING or ACCEPTED exchanges
    if (exchange.status === ExchangeStatus.COMPLETED) {
      throw new BadRequestException('Cannot cancel a completed exchange');
    }

    if (exchange.status === ExchangeStatus.CANCELLED || exchange.status === ExchangeStatus.EXPIRED) {
      throw new BadRequestException('Exchange is already cancelled or expired');
    }

    // Update exchange
    exchange.status = ExchangeStatus.CANCELLED;
    exchange.cancelled_at = new Date();
    exchange.cancelled_by = cancellingMemberId;
    exchange.cancellation_reason = CancellationReason[dto.reason];
    exchange.cancellation_note = dto.note || '';

    await this.exchangeRepo.save(exchange);

    // Release books back to AVAILABLE
    const bookIds = exchange.exchange_books.map((eb) => eb.book_id);
    await this.bookRepo.update(
      { book_id: In(bookIds) },
      { status: BookStatus.AVAILABLE },
    );

    this.logger.log(
      `Exchange ${exchangeId} cancelled by ${cancellingMemberId}, reason: ${dto.reason}`,
    );

    // Update trust scores ONLY for violator(s) based on cancellation reason
    this.logger.log('[cancelExchange] Updating trust scores after cancellation');
    
    if (dto.reason === 'USER_CANCELLED') {
      // Only the person who cancelled gets penalized
      await this.trustScoreService.updateTrustScore(cancellingMemberId);
      this.logger.log(`Penalized ${cancellingMemberId} for USER_CANCELLED`);
    } else if (dto.reason === 'NO_SHOW') {
      // Penalize the OTHER person (who didn't show up), NOT the canceller
      const noShowMemberId = cancellingMemberId === exchange.member_a_id 
        ? exchange.member_b_id 
        : exchange.member_a_id;
      await this.trustScoreService.updateTrustScore(noShowMemberId);
      this.logger.log(`Penalized ${noShowMemberId} for NO_SHOW (reported by ${cancellingMemberId})`);
    } else if (dto.reason === 'BOTH_NO_SHOW') {
      // Both members get penalized
      await this.trustScoreService.updateTrustScore(exchange.member_a_id);
      await this.trustScoreService.updateTrustScore(exchange.member_b_id);
      this.logger.log('Penalized both members for BOTH_NO_SHOW');
    } else if (dto.reason === 'DISPUTE') {
      // Both parties get light penalty pending admin review
      // Admin will adjust later based on investigation
      await this.trustScoreService.updateTrustScore(exchange.member_a_id);
      await this.trustScoreService.updateTrustScore(exchange.member_b_id);
      this.logger.warn(
        `DISPUTE raised for exchange ${exchangeId} by ${cancellingMemberId}. ` +
        `Both parties penalized pending admin review. Note: ${dto.note}`
      );
      // TODO: Create admin ticket for dispute resolution
    }
    // ADMIN_CANCELLED: No penalties for either party

    return {
      message: 'Exchange cancelled successfully',
      exchange_id: exchangeId,
      cancelled_by: cancellingMemberId,
      reason: dto.reason,
    };
  }

  // ==================== UPDATE MEETING INFO ====================
  async updateMeetingInfo(userId: string, exchangeId: string, dto: UpdateMeetingDto) {
    this.logger.log(`[updateMeetingInfo] exchangeId=${exchangeId} userId=${userId}`);

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
      relations: ['member_a', 'member_b', 'member_a.user', 'member_b.user', 'exchange_books', 'exchange_books.book'],
    });

    if (!exchange) {
      throw new NotFoundException('Exchange not found');
    }

    // Verify user is part of exchange
    let isPartOfExchange = false;
    let updatingMemberId: string | undefined;

    for (const memberId of memberIds) {
      if (exchange.member_a_id === memberId || exchange.member_b_id === memberId) {
        isPartOfExchange = true;
        updatingMemberId = memberId;
        break;
      }
    }

    if (!isPartOfExchange || !updatingMemberId) {
      throw new ForbiddenException('You are not part of this exchange');
    }

    // Can only update meeting info for PENDING or ACCEPTED exchanges
    if (exchange.status === ExchangeStatus.COMPLETED || 
        exchange.status === ExchangeStatus.CANCELLED || 
        exchange.status === ExchangeStatus.EXPIRED) {
      throw new BadRequestException('Cannot update meeting info for completed, cancelled, or expired exchanges');
    }

    // Update meeting fields
    if (dto.location !== undefined) {
      exchange.meeting_location = dto.location;
    }
    if (dto.time !== undefined) {
      exchange.meeting_time = new Date(dto.time);
    }
    if (dto.notes !== undefined) {
      exchange.meeting_notes = dto.notes;
    }

    exchange.meeting_updated_by = updatingMemberId;
    exchange.meeting_updated_at = new Date();

    await this.exchangeRepo.save(exchange);

    this.logger.log(
      `Meeting info updated for exchange ${exchangeId} by ${updatingMemberId}`,
    );

    return this.formatExchangeResponse(exchange);
  }

  // ==================== AUTO-EXPIRE CRON JOB ====================
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  async autoExpireExchanges() {
    this.logger.log('[autoExpireExchanges] Running auto-expiration check...');

    const now = new Date();

    // Find all PENDING exchanges that have expired
    const expiredExchanges = await this.exchangeRepo.find({
      where: {
        status: ExchangeStatus.PENDING,
        expires_at: LessThan(now),
      },
      relations: ['exchange_books', 'member_a', 'member_b'],
    });

    this.logger.log(`Found ${expiredExchanges.length} expired exchanges`);

    for (const exchange of expiredExchanges) {
      try {
        // Update exchange status
        exchange.status = ExchangeStatus.EXPIRED;
        exchange.cancelled_at = new Date();
        exchange.cancellation_reason = CancellationReason.AUTO_EXPIRED;
        exchange.cancellation_note = 'Exchange automatically expired due to timeout';

        await this.exchangeRepo.save(exchange);

        // Release books back to AVAILABLE
        const bookIds = exchange.exchange_books.map((eb) => eb.book_id);
        await this.bookRepo.update(
          { book_id: In(bookIds) },
          { status: BookStatus.AVAILABLE },
        );

        this.logger.log(
          `Exchange ${exchange.exchange_id} auto-expired (created: ${exchange.created_at}, expired: ${exchange.expires_at})`,
        );

        // Update trust scores (penalty ONLY for those who haven't confirmed)
        const penalizedMembers: string[] = [];
        
        if (!exchange.member_a_confirmed) {
          await this.trustScoreService.updateTrustScore(exchange.member_a_id);
          penalizedMembers.push(`${exchange.member_a.user?.full_name || exchange.member_a_id}`);
        }
        
        if (!exchange.member_b_confirmed) {
          await this.trustScoreService.updateTrustScore(exchange.member_b_id);
          penalizedMembers.push(`${exchange.member_b.user?.full_name || exchange.member_b_id}`);
        }
        
        if (penalizedMembers.length > 0) {
          this.logger.log(
            `Penalized for expiry: ${penalizedMembers.join(', ')} ` +
            `(A confirmed: ${exchange.member_a_confirmed}, B confirmed: ${exchange.member_b_confirmed})`
          );
        } else {
          this.logger.log('Both members confirmed but exchange expired (edge case)');
        }

        // TODO: Send notifications to both members
        // await this.notificationService.send({
        //   member_ids: [exchange.member_a_id, exchange.member_b_id],
        //   type: 'EXCHANGE_EXPIRED',
        //   data: { exchange_id: exchange.exchange_id }
        // });

      } catch (error) {
        this.logger.error(
          `Failed to expire exchange ${exchange.exchange_id}: ${error.message}`,
          error.stack,
        );
      }
    }

    this.logger.log(
      `[autoExpireExchanges] Completed. Expired ${expiredExchanges.length} exchanges`,
    );

    return {
      expired_count: expiredExchanges.length,
      timestamp: now.toISOString(),
    };
  }
}