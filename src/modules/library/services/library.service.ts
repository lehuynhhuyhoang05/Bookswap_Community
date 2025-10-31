// src/modules/library/services/library.service.ts
import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, Not, IsNull } from 'typeorm';
import { PersonalLibrary } from '../../../infrastructure/database/entities/personal-library.entity';
import { BookWanted } from '../../../infrastructure/database/entities/book-wanted.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import {
  CreateWantedBookDto,
  UpdateWantedBookDto,
  QueryWantedBooksDto,
} from '../dto/library.dto';

@Injectable()
export class LibraryService {
  private readonly logger = new Logger(LibraryService.name);

  constructor(
    @InjectRepository(PersonalLibrary)
    private libraryRepo: Repository<PersonalLibrary>,

    @InjectRepository(BookWanted)
    private wantedRepo: Repository<BookWanted>,

    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
  ) {}

  // ==================== INITIALIZE LIBRARY ====================
  async getOrCreateLibrary(memberId: string): Promise<PersonalLibrary> {
    this.logger.log(`[getOrCreateLibrary] memberId=${memberId}`);

    let library = await this.libraryRepo.findOne({
      where: { member_id: memberId },
      relations: ['member', 'member.user'],
    });

    if (!library) {
      this.logger.log(`Creating new library for member ${memberId}`);
      library = this.libraryRepo.create({
        member_id: memberId,
        total_owned_books: 0,
        total_wanted_books: 0,
      });
      await this.libraryRepo.save(library);
    }

    return library;
  }

  // ==================== GET LIBRARY STATS ====================
  async getLibraryStats(memberId: string) {
    this.logger.log(`[getLibraryStats] memberId=${memberId}`);

    const library = await this.getOrCreateLibrary(memberId);

    const wantedBooks = await this.wantedRepo.find({
      where: { library_id: library.library_id },
      order: { priority: 'DESC', added_at: 'DESC' },
      take: 5, // Top 5 most wanted
    });

    return {
      library_id: library.library_id,
      total_owned_books: library.total_owned_books,
      total_wanted_books: library.total_wanted_books,
      last_updated: library.last_updated,
      top_wanted_books: wantedBooks,
    };
  }

  // ==================== LIST WANTED BOOKS ====================
  async getWantedBooks(memberId: string, query: QueryWantedBooksDto) {
    this.logger.log(`[getWantedBooks] memberId=${memberId}, query=${JSON.stringify(query)}`);

    const library = await this.getOrCreateLibrary(memberId);

    const { page = 1, limit = 20, search, category, sort_by = 'priority', order = 'DESC' } = query;

    const queryBuilder = this.wantedRepo
      .createQueryBuilder('wanted')
      .where('wanted.library_id = :libraryId', { libraryId: library.library_id });

    // Search filter
    if (search) {
      queryBuilder.andWhere(
        '(wanted.title LIKE :search OR wanted.author LIKE :search)',
        { search: `%${search}%` },
      );
    }

    // Category filter
    if (category) {
      queryBuilder.andWhere('wanted.category = :category', { category });
    }

    // Sorting
    const sortField = sort_by === 'title' ? 'wanted.title' : 
                      sort_by === 'added_at' ? 'wanted.added_at' : 
                      'wanted.priority';
    queryBuilder.orderBy(sortField, order);

    // Pagination
    const [data, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // ==================== ADD WANTED BOOK ====================
  async addWantedBook(memberId: string, dto: CreateWantedBookDto) {
    this.logger.log(`[addWantedBook] memberId=${memberId}, dto=${JSON.stringify(dto)}`);

    // Validate: must have at least title or ISBN
    if (!dto.title && !dto.isbn) {
      throw new BadRequestException('Either title or ISBN is required');
    }

    const library = await this.getOrCreateLibrary(memberId);

    // Check duplicate ISBN
    if (dto.isbn) {
      const existing = await this.wantedRepo.findOne({
        where: {
          library_id: library.library_id,
          isbn: dto.isbn,
        },
      });

      if (existing) {
        throw new ConflictException('This book is already in your wanted list');
      }
    }

    // Create wanted book
    const wantedBook = this.wantedRepo.create({
      library_id: library.library_id,
      title: dto.title,
      author: dto.author,
      isbn: dto.isbn,
      google_books_id: dto.google_books_id,
      category: dto.category,
      priority: dto.priority ?? 0,
      notes: dto.notes,
    });

    await this.wantedRepo.save(wantedBook);

    // Update library stats
    await this.updateLibraryStats(library.library_id);

    this.logger.log(`Wanted book added: ${wantedBook.wanted_id}`);
    return wantedBook;
  }

  // ==================== UPDATE WANTED BOOK ====================
  async updateWantedBook(
    memberId: string,
    wantedId: string,
    dto: UpdateWantedBookDto,
  ) {
    this.logger.log(`[updateWantedBook] wantedId=${wantedId}, dto=${JSON.stringify(dto)}`);

    const library = await this.getOrCreateLibrary(memberId);

    const wantedBook = await this.wantedRepo.findOne({
      where: {
        wanted_id: wantedId,
        library_id: library.library_id,
      },
    });

    if (!wantedBook) {
      throw new NotFoundException('Wanted book not found in your library');
    }

    // Check ISBN conflict if changing ISBN
    if (dto.isbn && dto.isbn !== wantedBook.isbn) {
      const existing = await this.wantedRepo.findOne({
        where: {
          library_id: library.library_id,
          isbn: dto.isbn,
          wanted_id: Not(wantedId),
        },
      });

      if (existing) {
        throw new ConflictException('Another book with this ISBN already exists in your wanted list');
      }
    }

    // Update fields
    Object.assign(wantedBook, dto);
    await this.wantedRepo.save(wantedBook);

    // Update library timestamp
    await this.updateLibraryStats(library.library_id);

    this.logger.log(`Wanted book updated: ${wantedId}`);
    return wantedBook;
  }

  // ==================== DELETE WANTED BOOK ====================
  async deleteWantedBook(memberId: string, wantedId: string) {
    this.logger.log(`[deleteWantedBook] wantedId=${wantedId}`);

    const library = await this.getOrCreateLibrary(memberId);

    const wantedBook = await this.wantedRepo.findOne({
      where: {
        wanted_id: wantedId,
        library_id: library.library_id,
      },
    });

    if (!wantedBook) {
      throw new NotFoundException('Wanted book not found in your library');
    }

    await this.wantedRepo.remove(wantedBook);

    // Update library stats
    await this.updateLibraryStats(library.library_id);

    this.logger.log(`Wanted book deleted: ${wantedId}`);
    return { message: 'Wanted book removed successfully' };
  }

  // ==================== HELPER: UPDATE LIBRARY STATS ====================
  private async updateLibraryStats(libraryId: string) {
    const wantedCount = await this.wantedRepo.count({
      where: { library_id: libraryId },
    });

    await this.libraryRepo.update(libraryId, {
      total_wanted_books: wantedCount,
      last_updated: new Date(),
    });
  }

  // ==================== GET SINGLE WANTED BOOK ====================
  async getWantedBookById(memberId: string, wantedId: string) {
    this.logger.log(`[getWantedBookById] wantedId=${wantedId}`);

    const library = await this.getOrCreateLibrary(memberId);

    const wantedBook = await this.wantedRepo.findOne({
      where: {
        wanted_id: wantedId,
        library_id: library.library_id,
      },
    });

    if (!wantedBook) {
      throw new NotFoundException('Wanted book not found');
    }

    return wantedBook;
  }
}