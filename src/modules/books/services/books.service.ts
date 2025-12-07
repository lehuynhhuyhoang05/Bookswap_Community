import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, Brackets } from 'typeorm';
import { Book, BookStatus } from '../../../infrastructure/database/entities/book.entity';
import { BookWanted } from '../../../infrastructure/database/entities/book-wanted.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Exchange, ExchangeStatus } from '../../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../../infrastructure/database/entities/exchange-book.entity';
import { CreateBookDto, UpdateBookDto } from '../dto/create-book.dto';
import { SearchBooksDto, AdvancedSearchDto } from '../dto/books.dto';
import { GoogleBooksService } from '../../../infrastructure/external-services/google-books/google-books.service';
import { GoogleBookResult } from '../../../infrastructure/external-services/google-books/google-books.types';
import { ActivityLogService } from '../../../common/services/activity-log.service';
import { UserActivityAction } from '../../../infrastructure/database/entities/user-activity-log.entity';

function withTimeout<T>(p: Promise<T>, ms: number, tag = 'timeout'): Promise<T> {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(tag)), ms);
    p.then((v) => { clearTimeout(t); resolve(v); })
     .catch((e) => { clearTimeout(t); reject(e); });
  });
}

@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private readonly bookRepository: Repository<Book>,
    @InjectRepository(BookWanted)
    private readonly wantedRepo: Repository<BookWanted>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Exchange)
    private readonly exchangeRepository: Repository<Exchange>,
    @InjectRepository(ExchangeBook)
    private readonly exchangeBookRepository: Repository<ExchangeBook>,
    private readonly googleBooksService: GoogleBooksService,
    private readonly activityLogService: ActivityLogService,
  ) {}

  // ==================== NEW: BASIC SEARCH (Public) ====================
  /**
   * F-GUEST-02: Tìm kiếm sách cơ bản theo tiêu đề và tác giả
   * UC-02: Tìm kiếm sách cơ bản
   */
  async searchBooks(query: SearchBooksDto) {
    this.logger.log(`[searchBooks] query=${JSON.stringify(query)}`);

    const { q, category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        // BOOK fields
        'book.book_id',
        'book.owner_id',
        'book.title',
        'book.author',
        'book.isbn',
        'book.google_books_id',
        'book.publisher',
        'book.publish_date',
        'book.description',
        'book.category',
        'book.language',
        'book.page_count',
        'book.cover_image_url',
        'book.user_photos',
        'book.condition_notes',
        'book.book_condition',
        'book.status',
        'book.views',
        'book.created_at',
        'book.updated_at',

        // OWNER fields
        'owner.member_id',
        'owner.region',
        'owner.trust_score',
        'owner.average_rating',

        // USER fields (no password_hash)
        'user.user_id',
        'user.full_name',
        'user.avatar_url',
      ])
      .where('book.deleted_at IS NULL')
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere(
        new Brackets(qb => {
          qb.where('book.title LIKE :search', { search: `%${q}%` })
            .orWhere('book.author LIKE :search', { search: `%${q}%` })
            .orWhere('book.isbn LIKE :search', { search: `%${q}%` });
        })
      );

    // Category filter
    if (category) {
      qb.andWhere('book.category = :category', { category });
    }

    // Pagination
    const [books, total] = await qb
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`[searchBooks] found=${books.length} total=${total} for query="${q}"`);

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query: q,
      },
    };
  }

  // ==================== NEW: ADVANCED SEARCH (Members) ====================
  /**
   * F-MEM-04: Tìm kiếm nâng cao (theo thể loại, khu vực)
   * UC-08: Tìm kiếm nâng cao
   */
  async advancedSearch(query: AdvancedSearchDto) {
    this.logger.log(`[advancedSearch] query=${JSON.stringify(query)}`);

    const {
      title,
      author,
      isbn,
      category,
      region,
      condition,
      sort_by = 'created_at',
      order = 'DESC',
      page = 1,
      limit = 20,
    } = query;

    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        // BOOK
        'book.book_id',
        'book.owner_id',
        'book.title',
        'book.author',
        'book.isbn',
        'book.google_books_id',
        'book.publisher',
        'book.publish_date',
        'book.description',
        'book.category',
        'book.language',
        'book.page_count',
        'book.cover_image_url',
        'book.user_photos',
        'book.condition_notes',
        'book.book_condition',
        'book.status',
        'book.views',
        'book.created_at',
        'book.updated_at',

        // OWNER
        'owner.member_id',
        'owner.region',
        'owner.trust_score',
        'owner.average_rating',

        // USER (no password)
        'user.user_id',
        'user.full_name',
        'user.avatar_url',
      ])
      .where('book.deleted_at IS NULL')
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE });

    // Title filter (partial match)
    if (title) {
      qb.andWhere('book.title LIKE :title', { title: `%${title}%` });
    }

    // Author filter (partial match)
    if (author) {
      qb.andWhere('book.author LIKE :author', { author: `%${author}%` });
    }

    // ISBN filter (exact match)
    if (isbn) {
      qb.andWhere('book.isbn = :isbn', { isbn });
    }

    // Category filter
    if (category) {
      qb.andWhere('book.category = :category', { category });
    }

    // Region filter
    if (region) {
      qb.andWhere('owner.region = :region', { region });
    }

    // Condition filter
    if (condition) {
      qb.andWhere('book.book_condition = :condition', { condition });
    }

    // Sorting
    const sortField =
      sort_by === 'title' ? 'book.title' :
      sort_by === 'author' ? 'book.author' :
      'book.created_at';

    qb.orderBy(sortField, order);

    // Pagination
    const [books, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`[advancedSearch] found=${books.length} total=${total}`);

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        filters: { title, author, isbn, category, region, condition },
      },
    };
  }

  // ==================== NEW: SEARCH WANTED BOOKS ====================
  /**
   * Search books that other members want
   * Useful for members to see what they can offer to trade
   */
  async searchWantedBooks(query: SearchBooksDto) {
    this.logger.log(`[searchWantedBooks] query=${JSON.stringify(query)}`);

    const { q, category, page = 1, limit = 20 } = query;
    const skip = (page - 1) * limit;

    const qb = this.wantedRepo
      .createQueryBuilder('wanted')
      .leftJoin('wanted.library', 'library')
      .leftJoin('library.member', 'member')
      .leftJoin('member.user', 'user')
      .select([
        // WANTED BOOK
        'wanted.wanted_id',
        'wanted.library_id',
        'wanted.title',
        'wanted.author',
        'wanted.isbn',
        'wanted.google_books_id',
        'wanted.category',
        'wanted.priority',
        'wanted.notes',
        'wanted.added_at',

        // MEMBER
        'member.member_id',
        'member.region',
        'member.trust_score',
        'member.average_rating',

        // USER (no password)
        'user.user_id',
        'user.full_name',
        'user.avatar_url',
      ])
      .where(
        new Brackets(qb => {
          qb.where('wanted.title LIKE :search', { search: `%${q}%` })
            .orWhere('wanted.author LIKE :search', { search: `%${q}%` })
            .orWhere('wanted.isbn LIKE :search', { search: `%${q}%` });
        })
      );

    // Category filter
    if (category) {
      qb.andWhere('wanted.category = :category', { category });
    }

    // Sort by priority (highest first), then by date
    qb.orderBy('wanted.priority', 'DESC');
    qb.addOrderBy('wanted.added_at', 'DESC');

    // Pagination
    const [wantedBooks, total] = await qb
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`[searchWantedBooks] found=${wantedBooks.length} total=${total} for query="${q}"`);

    return {
      data: wantedBooks,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        query: q,
      },
    };
  }

  // ==================== EXISTING METHODS (Keep all) ====================

 async createBook(userId: string, createBookDto: CreateBookDto): Promise<Book> {
  this.logger.log(`[createBook] >>> start userId=${userId || '(none)'} title="${createBookDto?.title}"`);

  try {
    if (!userId) {
      this.logger.error('[createBook] Missing userId');
      throw new UnauthorizedException('Missing user');
    }

    const member = await this.memberRepository.findOne({ where: { user_id: userId } });
    this.logger.debug(`[createBook] member=${member ? member.member_id : 'null'}`);

    if (!member) {
      this.logger.warn('[createBook] Member profile not found');
      throw new NotFoundException('Member profile not found');
    }

    // Check Trust Score - Block if too low (scale 0-100)
    const trustScore = Number(member.trust_score) || 0;
    this.logger.log(`[createBook] userId=${userId}, member_id=${member.member_id}, trust_score=${trustScore} (raw=${member.trust_score}, type=${typeof member.trust_score})`);
    
    if (trustScore < 20) { // < 20 points: Cannot post books
      this.logger.warn(`[createBook] Trust score too low: ${trustScore} < 20`);
      throw new ForbiddenException(
        'Điểm uy tín của bạn quá thấp để đăng sách mới. ' +
        'Vui lòng liên hệ admin để được hỗ trợ.'
      );
    }
    
    this.logger.log(`[createBook] Trust score OK: ${trustScore} >= 20, proceeding...`);

    // Google Books integration – BỎ QUA nếu placeholder/invalid + hard-timeout
    const gbId = createBookDto.google_books_id?.trim();
    const shouldFetch =
      !!gbId &&
      gbId.toLowerCase() !== 'string' &&
      gbId.length > 5;

    if (shouldFetch) {
      this.logger.debug(`[createBook] google_books_id=${gbId} - Fetching metadata...`);
      try {
        const gb = await withTimeout(
          this.googleBooksService.getBookById(gbId),
          5000, // ← TĂNG TỪ 3000 LÊN 5000ms
          'GoogleBooks timeout',
        );
        this.logger.debug(`[createBook] GoogleBooks fetched successfully: title="${gb?.title}"`);

        createBookDto = {
          ...createBookDto,
          title: createBookDto.title || gb.title,
          author: createBookDto.author || gb.authors?.join(', '),
          publisher: createBookDto.publisher || gb.publisher,
          publish_date: createBookDto.publish_date || gb.publishedDate,
          description: createBookDto.description || gb.description,
          cover_image_url: createBookDto.cover_image_url || gb.imageLinks?.thumbnail,
          language: createBookDto.language || gb.language || 'vi',
          category: createBookDto.category || gb.categories?.[0],
          isbn: createBookDto.isbn || gb.isbn,
          page_count: createBookDto.page_count || gb.pageCount,
        };
      } catch (err: any) {
        // Không throw để không chặn tạo sách
        this.logger.warn(`[createBook] Skip GoogleBooks enrich: ${err?.message}`);
      }
    }

    const toSave = this.bookRepository.create({
      ...createBookDto,
      owner_id: member.member_id,
      language: createBookDto.language || 'vi',
    });

    const saved = await this.bookRepository.save(toSave);
    this.logger.log(`[createBook] <<< saved book_id=${saved.book_id}`);

    // Log activity
    await this.activityLogService.logActivity({
      user_id: userId,
      action: UserActivityAction.CREATE_BOOK,
      entity_type: 'BOOK',
      entity_id: saved.book_id,
      metadata: { title: saved.title, author: saved.author },
    });

    return saved;
  } catch (err: any) {
    this.logger.error('[createBook] ERROR', err?.stack || err);
    if (err instanceof UnauthorizedException) throw err;
    if (err instanceof NotFoundException) throw err;
    if (err instanceof ForbiddenException) throw err;
    throw new InternalServerErrorException('Cannot create book');
  }
}

  /** LOG #2: Danh sách public */
  async findAll(page: number = 1, limit: number = 20, search?: string) {
    this.logger.log(`[findAll] page=${page} limit=${limit} search="${search || ''}"`);
    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        'book.book_id', 'book.owner_id', 'book.title', 'book.author',
        'book.isbn', 'book.google_books_id', 'book.publisher',
        'book.publish_date', 'book.description', 'book.category',
        'book.language', 'book.page_count', 'book.cover_image_url',
        'book.user_photos', 'book.condition_notes',
        'book.book_condition', 'book.status', 'book.views',
        'book.deleted_at', 'book.created_at', 'book.updated_at',
        'owner.member_id', 'owner.user_id', 'owner.region',
        'owner.phone', 'owner.address', 'owner.bio',
        'owner.trust_score', 'owner.average_rating',
        'user.user_id', 'user.email', 'user.full_name',
        'user.avatar_url', 'user.role',
      ])
      .where('book.deleted_at IS NULL')
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE });

    if (search) {
      qb.andWhere(
        '(book.title LIKE :search OR book.author LIKE :search OR book.isbn LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [books, total] = await qb
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    this.logger.debug(`[findAll] found=${books.length} total=${total}`);

    return {
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /** LOG #3: My library */
  async findMyBooks(userId: string) {
    this.logger.log(`[findMyBooks] userId=${userId}`);
    const member = await this.memberRepository.findOne({ where: { user_id: userId } });

    if (!member) {
      throw new NotFoundException('Member profile not found');
    }

    const items = await this.bookRepository.find({
      where: { owner_id: member.member_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });

    this.logger.debug(`[findMyBooks] items=${items.length}`);
    return items;
  }

  /** LOG #4: Chi tiết */
  async findOne(bookId: string): Promise<Book> {
    this.logger.log(`[findOne] bookId=${bookId}`);

    await this.bookRepository
      .createQueryBuilder()
      .update(Book)
      .set({ views: () => 'views + 1' })
      .where('book_id = :bookId', { bookId })
      .execute();

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        'book.book_id', 'book.owner_id', 'book.title', 'book.author',
        'book.isbn', 'book.category', 'book.book_condition',
        'book.status', 'book.views', 'book.created_at', 'book.updated_at',
        'book.cover_image_url', 'book.description', 'book.publisher',
        'book.publish_date', 'book.language', 'book.page_count',
        'owner.member_id', 'owner.region', 'owner.trust_score', 'owner.completed_exchanges',
        'user.user_id', 'user.full_name', 'user.avatar_url',
      ])
      .where('book.book_id = :bookId', { bookId })
      .andWhere('book.deleted_at IS NULL');

    const book = await qb.getOne();

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    return book;
  }

  /** LOG #5: Update */
  async update(bookId: string, userId: string, updateBookDto: UpdateBookDto): Promise<Book> {
    this.logger.log(`[update] bookId=${bookId} userId=${userId}`);
    const book = await this.findOne(bookId);

    const member = await this.memberRepository.findOne({ where: { user_id: userId } });

    if (!member || book.owner_id !== member.member_id) {
      throw new ForbiddenException('You can only update your own books');
    }

    Object.assign(book, updateBookDto);
    const saved = await this.bookRepository.save(book);
    this.logger.log(`[update] <<< saved book_id=${saved.book_id}`);

    // Log activity
    await this.activityLogService.logActivity({
      user_id: userId,
      action: UserActivityAction.UPDATE_BOOK,
      entity_type: 'BOOK',
      entity_id: saved.book_id,
      metadata: { title: saved.title },
    });

    return saved;
  }

  /** LOG #6: Remove */
  async remove(bookId: string, userId: string): Promise<void> {
    this.logger.log(`[remove] bookId=${bookId} userId=${userId}`);
    const book = await this.findOne(bookId);

    const member = await this.memberRepository.findOne({ where: { user_id: userId } });

    if (!member || book.owner_id !== member.member_id) {
      throw new ForbiddenException('You can only delete your own books');
    }

    book.deleted_at = new Date();
    book.status = BookStatus.REMOVED;
    await this.bookRepository.save(book);
    this.logger.log(`[remove] <<< soft-deleted book_id=${book.book_id}`);

    // Log activity
    await this.activityLogService.logActivity({
      user_id: userId,
      action: UserActivityAction.DELETE_BOOK,
      entity_type: 'BOOK',
      entity_id: book.book_id,
      metadata: { title: book.title },
    });
  }

  /** LOG #7: Google Books search */
  async searchGoogleBooks(query: string, maxResults: number = 20): Promise<GoogleBookResult[]> {
    this.logger.log(`[searchGoogleBooks] query="${query}" maxResults=${maxResults}`);
    const rs = await this.googleBooksService.searchBooks(query, maxResults);
    this.logger.debug(`[searchGoogleBooks] items=${rs?.length || 0}`);
    return rs;
  }

  /** LOG #8: By category */
  async findBooksByCategory(category: string, page: number = 1, limit: number = 20) {
    this.logger.log(`[findBooksByCategory] category="${category}"`);
    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        'book.book_id', 'book.title', 'book.author', 'book.category',
        'book.book_condition', 'book.created_at',
        'owner.member_id', 'owner.region',
        'user.user_id', 'user.full_name',
      ])
      .where('book.category = :category', { category })
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere('book.deleted_at IS NULL');

    const [books, total] = await qb
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getGoogleBookById(googleBookId: string) {
    return this.googleBooksService.getBookById(googleBookId);
  }

  async searchGoogleBookByISBN(isbn: string) {
    return this.googleBooksService.searchByISBN(isbn);
  }

  /** LOG #9: By region */
  async findBooksByRegion(region: string, page: number = 1, limit: number = 20) {
    this.logger.log(`[findBooksByRegion] region="${region}"`);
    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoin('book.owner', 'owner')
      .leftJoin('owner.user', 'user')
      .select([
        'book.book_id', 'book.title', 'book.author', 'book.created_at',
        'owner.member_id', 'owner.region',
        'user.user_id', 'user.full_name',
      ])
      .where('owner.region = :region', { region })
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere('book.deleted_at IS NULL');

    const [books, total] = await qb
      .orderBy('book.created_at', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data: books,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit), region },
    };
  }

  /** LOG #10: Available regions */
  async getAvailableRegions() {
    this.logger.log(`[getAvailableRegions] fetching distinct regions`);

    const result = await this.bookRepository
      .createQueryBuilder('book')
      .innerJoin('book.owner', 'owner')
      .select('DISTINCT owner.region', 'region')
      .where('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere('book.deleted_at IS NULL')
      .andWhere('owner.region IS NOT NULL')
      .andWhere('owner.region != :empty', { empty: '' })
      .orderBy('owner.region', 'ASC')
      .getRawMany();

    const regions = result
      .map((r) => r.region)
      .filter((r) => r && r.trim().length > 0);

    return { regions, total: regions.length };
  }

  // ==================== BOOK EXCHANGE HISTORY ====================
  /**
   * Get exchange history for a specific book
   * Shows the journey of the book through different owners
   */
  async getBookExchangeHistory(bookId: string, limit = 20) {
    this.logger.log(`[getBookExchangeHistory] bookId=${bookId} limit=${limit}`);

    // 1. Verify book exists
    const book = await this.bookRepository.findOne({
      where: { book_id: bookId },
      relations: ['owner', 'owner.user'],
    });

    if (!book) {
      throw new NotFoundException('Book not found');
    }

    // 2. Find all exchange_books involving this book
    const exchangeBooks = await this.exchangeBookRepository.find({
      where: { book_id: bookId },
      relations: [
        'exchange',
        'exchange.member_a',
        'exchange.member_a.user',
        'exchange.member_b',
        'exchange.member_b.user',
      ],
      take: limit,
    });

    // Filter only COMPLETED and sort by date
    const completedExchangeBooks = exchangeBooks
      .filter(eb => eb.exchange?.status === ExchangeStatus.COMPLETED)
      .sort((a, b) => {
        const dateA = a.exchange.completed_at ? new Date(a.exchange.completed_at).getTime() : 0;
        const dateB = b.exchange.completed_at ? new Date(b.exchange.completed_at).getTime() : 0;
        return dateB - dateA; // DESC order
      });

    // 3. Format response
    const exchanges = completedExchangeBooks.map(eb => {
        const exchange = eb.exchange;
        const fromMember = eb.from_member_id === exchange.member_a_id 
          ? exchange.member_a 
          : exchange.member_b;
        const toMember = eb.to_member_id === exchange.member_a_id 
          ? exchange.member_a 
          : exchange.member_b;

        // Count other books in this exchange
        const otherBooksCount = (exchange.exchange_books?.length || 1) - 1;

        return {
          exchange_id: exchange.exchange_id,
          from_member: {
            member_id: fromMember.member_id,
            name: fromMember.user?.full_name || 'Unknown',
            avatar_url: fromMember.user?.avatar_url || null,
            region: fromMember.region || null,
          },
          to_member: {
            member_id: toMember.member_id,
            name: toMember.user?.full_name || 'Unknown',
            avatar_url: toMember.user?.avatar_url || null,
            region: toMember.region || null,
          },
          completed_at: exchange.completed_at,
          other_books_count: otherBooksCount,
        };
      });

    // 4. Get current owner info
    const currentOwner = book.owner ? {
      member_id: book.owner.member_id,
      name: book.owner.user?.full_name || 'Unknown',
      avatar_url: book.owner.user?.avatar_url || null,
      region: book.owner.region || null,
      trust_score: book.owner.trust_score || 0,
    } : null;

    return {
      book_id: book.book_id,
      title: book.title,
      author: book.author,
      current_owner: currentOwner,
      total_exchanges: exchanges.length,
      exchanges,
    };
  }
}
