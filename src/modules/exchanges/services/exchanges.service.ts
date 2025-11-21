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
import { Repository, In, IsNull } from 'typeorm';
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
} from '../../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../../infrastructure/database/entities/exchange-book.entity';
import {
  CreateExchangeRequestDto,
  RespondToRequestDto,
  QueryExchangeRequestsDto,
  QueryExchangesDto,
} from '../dto/exchange.dto';

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

    // 10. Update book status to EXCHANGING
    await this.bookRepo.update(
      { book_id: In([...dto.offered_book_ids, ...dto.requested_book_ids]) },
      { status: BookStatus.EXCHANGING },
    );

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

    // 5. Accept or Reject
    if (dto.action === 'accept') {
      return this.acceptRequest(request);
    } else {
      return this.rejectRequest(request, dto.rejection_reason);
    }
  }

  // ==================== ACCEPT REQUEST ====================
  private async acceptRequest(request: ExchangeRequest) {
    // 1. Update request status
    request.status = ExchangeRequestStatus.ACCEPTED;
    request.responded_at = new Date();
    await this.requestRepo.save(request);

    // 2. Create Exchange
    const exchange = this.exchangeRepo.create({
      exchange_id: uuidv4(),
      request_id: request.request_id,
      member_a_id: request.requester_id,
      member_b_id: request.receiver_id,
      status: ExchangeStatus.PENDING,
    });

    await this.exchangeRepo.save(exchange);

    // 3. Create ExchangeBooks
    const requestBooks = await this.requestBookRepo.find({
      where: { request_id: request.request_id },
    });

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
      created_at: exchange.created_at,
    };
  }
}