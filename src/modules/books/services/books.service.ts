// src/modules/books/services/books.service.ts
import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  InternalServerErrorException,
  UnauthorizedException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Book, BookStatus } from '../../../infrastructure/database/entities/book.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { CreateBookDto, UpdateBookDto } from '../dto/create-book.dto';
import { GoogleBooksService } from '../../../infrastructure/external-services/google-books/google-books.service';
import { GoogleBookResult } from '../../../infrastructure/external-services/google-books/google-books.types';
@Injectable()
export class BooksService {
  private readonly logger = new Logger(BooksService.name);

  constructor(
    @InjectRepository(Book)
    private bookRepository: Repository<Book>,
    @InjectRepository(Member)
    private memberRepository: Repository<Member>,
    private googleBooksService: GoogleBooksService,
  ) {}

  /** ---------------------------------------------------------
   *  LOG #1: Tạo sách — theo dõi userId, member, dữ liệu GoogleBooks
   *  --------------------------------------------------------- */
  async createBook(userId: string, createBookDto: CreateBookDto): Promise<Book> {
    this.logger.log(`[createBook] >>> start userId=${userId || '(none)'} title="${createBookDto?.title}"`);

    try {
      if (!userId) {
        this.logger.error('[createBook] Missing userId (req.user.sub). Thường do Guard/JWT không set req.user.');
        throw new UnauthorizedException('Missing user');
      }

      // Get member_id from user_id
      const member = await this.memberRepository.findOne({ where: { user_id: userId } });
      this.logger.debug(`[createBook] member=${member ? member.member_id : 'null'} (from user=${userId})`);

      if (!member) {
        this.logger.warn('[createBook] Member profile not found');
        throw new NotFoundException('Member profile not found');
      }

      // If google_books_id provided, fetch additional data
      if (createBookDto.google_books_id) {
        this.logger.debug(`[createBook] google_books_id=${createBookDto.google_books_id} → fetch Google Books`);
        try {
          const gb = await this.googleBooksService.getBookById(createBookDto.google_books_id);
          this.logger.debug(`[createBook] GoogleBooks fetched: title="${gb?.title}" isbn="${gb?.isbn || '(none)'}"`);

          // Merge Google Books data with user input
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
          this.logger.warn(`[createBook] GoogleBooks fetch failed: ${err?.message || err}`);
          // Tiếp tục với dữ liệu user-provided
        }
      }

      const toSave = this.bookRepository.create({
        ...createBookDto,
        owner_id: member.member_id,
        language: createBookDto.language || 'vi',
      });

      this.logger.debug(`[createBook] saving book draft: title="${toSave.title}" owner=${toSave.owner_id}`);
      const saved = await this.bookRepository.save(toSave);
      this.logger.log(`[createBook] <<< saved book_id=${saved.book_id} title="${saved.title}"`);

      return saved;
    } catch (err: any) {
      this.logger.error('[createBook] ERROR', err?.stack || err);
      if (err instanceof UnauthorizedException) throw err;
      if (err instanceof NotFoundException) throw err;
      if (err instanceof ForbiddenException) throw err;
      throw new InternalServerErrorException('Cannot create book');
    }
  }

  /** ---------------------------------------------------------
   *  LOG #2: Danh sách public — phân trang & search
   *  --------------------------------------------------------- */
  async findAll(page: number = 1, limit: number = 20, search?: string) {
    this.logger.log(`[findAll] page=${page} limit=${limit} search="${search || ''}"`);
    const skip = (page - 1) * limit;

    const qb = this.bookRepository
      .createQueryBuilder('book')
      .leftJoinAndSelect('book.owner', 'owner')
      .leftJoinAndSelect('owner.user', 'user')
      .where('book.deleted_at IS NULL')
      .andWhere('book.status = :status', { status: BookStatus.AVAILABLE });

    if (search) {
      qb.andWhere(
        '(book.title LIKE :search OR book.author LIKE :search OR book.isbn LIKE :search OR book.category LIKE :search)',
        { search: `%${search}%` },
      );
    }

    const [books, total] = await qb.skip(skip).take(limit).orderBy('book.created_at', 'DESC').getManyAndCount();
    this.logger.debug(`[findAll] found=${books.length} total=${total}`);

    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /** ---------------------------------------------------------
   *  LOG #3: My library — ràng buộc theo userId
   *  --------------------------------------------------------- */
  async findMyBooks(userId: string) {
    this.logger.log(`[findMyBooks] userId=${userId}`);
    const member = await this.memberRepository.findOne({ where: { user_id: userId } });

    if (!member) {
      this.logger.warn('[findMyBooks] Member profile not found');
      throw new NotFoundException('Member profile not found');
    }

    const items = await this.bookRepository.find({
      where: { owner_id: member.member_id, deleted_at: IsNull() },
      order: { created_at: 'DESC' },
    });
    this.logger.debug(`[findMyBooks] items=${items.length} for member=${member.member_id}`);
    return items;
  }

  /** ---------------------------------------------------------
   *  LOG #4: Chi tiết — auto tăng views
   *  --------------------------------------------------------- */
  async findOne(bookId: string): Promise<Book> {
    this.logger.log(`[findOne] bookId=${bookId}`);
    const book = await this.bookRepository.findOne({
      where: { book_id: bookId, deleted_at: IsNull() },
      relations: ['owner', 'owner.user'],
    });

    if (!book) {
      this.logger.warn('[findOne] Book not found');
      throw new NotFoundException('Book not found');
    }

    book.views += 1;
    await this.bookRepository.save(book);
    this.logger.debug(`[findOne] +1 view -> views=${book.views}`);
    return book;
  }

  /** ---------------------------------------------------------
   *  LOG #5: Update — kiểm tra quyền sở hữu
   *  --------------------------------------------------------- */
  async update(bookId: string, userId: string, updateBookDto: UpdateBookDto): Promise<Book> {
    this.logger.log(`[update] bookId=${bookId} userId=${userId}`);
    const book = await this.findOne(bookId);

    const member = await this.memberRepository.findOne({ where: { user_id: userId } });
    this.logger.debug(`[update] member=${member ? member.member_id : 'null'} / owner=${book.owner_id}`);

    if (!member || book.owner_id !== member.member_id) {
      this.logger.warn('[update] Forbidden: not owner');
      throw new ForbiddenException('You can only update your own books');
    }

    Object.assign(book, updateBookDto);
    const saved = await this.bookRepository.save(book);
    this.logger.log(`[update] <<< saved book_id=${saved.book_id} title="${saved.title}"`);
    return saved;
  }

  /** ---------------------------------------------------------
   *  LOG #6: Remove — soft delete + đổi status
   *  --------------------------------------------------------- */
  async remove(bookId: string, userId: string): Promise<void> {
    this.logger.log(`[remove] bookId=${bookId} userId=${userId}`);
    const book = await this.findOne(bookId);

    const member = await this.memberRepository.findOne({ where: { user_id: userId } });
    this.logger.debug(`[remove] member=${member ? member.member_id : 'null'} / owner=${book.owner_id}`);

    if (!member || book.owner_id !== member.member_id) {
      this.logger.warn('[remove] Forbidden: not owner');
      throw new ForbiddenException('You can only delete your own books');
    }

    book.deleted_at = new Date();
    book.status = BookStatus.REMOVED;
    await this.bookRepository.save(book);
    this.logger.log(`[remove] <<< soft-deleted book_id=${book.book_id}`);
  }

  /** ---------------------------------------------------------
   *  LOG #7: Google Books search — theo dõi query/maxResults
   *  --------------------------------------------------------- */
 async searchGoogleBooks(query: string, maxResults: number = 20): Promise<GoogleBookResult[]> {
  this.logger.log(`[searchGoogleBooks] query="${query}" maxResults=${maxResults}`);

  const rs = await this.googleBooksService.searchBooks(query, maxResults);
  // rs hiện là GoogleBookResult[]

  const count = Array.isArray(rs) ? rs.length : 0;
  this.logger.debug(`[searchGoogleBooks] items=${count}`);

  return rs; // trả về mảng
}
  /** ---------------------------------------------------------
   *  LOG #8: By category — phân trang
   *  --------------------------------------------------------- */
  async findBooksByCategory(category: string, page: number = 1, limit: number = 20) {
    this.logger.log(`[findBooksByCategory] category="${category}" page=${page} limit=${limit}`);
    const skip = (page - 1) * limit;

    const [books, total] = await this.bookRepository.findAndCount({
      where: {
        category,
        status: BookStatus.AVAILABLE,
        deleted_at: IsNull(),
      },
      relations: ['owner', 'owner.user'],
      skip,
      take: limit,
      order: { created_at: 'DESC' },
    });

    this.logger.debug(`[findBooksByCategory] found=${books.length} total=${total}`);
    return {
      data: books,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
  async getGoogleBookById(googleBookId: string) {
  this.logger.log(`[getGoogleBookById] id=${googleBookId}`);
  return this.googleBooksService.getBookById(googleBookId);
}

async searchGoogleBookByISBN(isbn: string) {
  this.logger.log(`[searchGoogleBookByISBN] isbn=${isbn}`);
  return this.googleBooksService.searchByISBN(isbn);
}
}
