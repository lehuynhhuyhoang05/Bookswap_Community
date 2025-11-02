// src/modules/exchanges/services/matching.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Book, BookStatus } from '../../../infrastructure/database/entities/book.entity';
import { BookWanted } from '../../../infrastructure/database/entities/book-wanted.entity';
import { ExchangeSuggestion } from '../../../infrastructure/database/entities/exchange-suggestion.entity';
import { BookMatchPair } from '../../../infrastructure/database/entities/book-match-pair.entity';

interface MatchScore {
  score: number;
  reasons: string[];
}

interface PotentialMatch {
  otherMember: Member;
  myBooksTheyWant: Array<{
    myBook: Book;
    theirWant: BookWanted;
    score: MatchScore;
  }>;
  theirBooksIWant: Array<{
    theirBook: Book;
    myWant: BookWanted;
    score: MatchScore;
  }>;
  totalScore: number;
}

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,

    @InjectRepository(Book)
    private bookRepo: Repository<Book>,

    @InjectRepository(BookWanted)
    private wantedRepo: Repository<BookWanted>,

    @InjectRepository(ExchangeSuggestion)
    private suggestionRepo: Repository<ExchangeSuggestion>,

    @InjectRepository(BookMatchPair)
    private pairRepo: Repository<BookMatchPair>,
  ) {}

  /**
   * F-MEM-07: Gợi ý các cặp trao đổi tiềm năng
   */
  async findMatchingSuggestions(userId: string) {
    this.logger.log(`[findMatchingSuggestions] Finding matches for userId=${userId}`);

    // 1) Lấy member theo userId
    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    // 2) Lấy wanted books của tôi
    const myWantedBooks = await this.wantedRepo.find({
      where: { library: { member_id: member.member_id } },
      relations: ['library'],
    });
    if (myWantedBooks.length === 0) {
      this.logger.debug('[findMatchingSuggestions] No wanted books found');
      return { suggestions: [], total: 0 };
    }

    // 3) Lấy sách đang AVAILABLE của tôi
    const myAvailableBooks = await this.bookRepo.find({
      where: {
        owner_id: member.member_id,
        status: BookStatus.AVAILABLE,
        deleted_at: IsNull(),
      },
    });
    if (myAvailableBooks.length === 0) {
      this.logger.debug('[findMatchingSuggestions] No available books to offer');
      return { suggestions: [], total: 0 };
    }

    // 4) Tìm đối tác tiềm năng (two-way)
    const potentialMatches: PotentialMatch[] = [];
    const processedMembers = new Set<string>();

    for (const myWant of myWantedBooks) {
      const booksIWant = await this.findBooksMatchingWant(myWant, member.member_id);

      for (const bookIWant of booksIWant) {
        if (processedMembers.has(bookIWant.owner_id)) continue;

        // Họ có sách tôi muốn → check xem họ có muốn sách của tôi (two-way)
        const theirWants = await this.wantedRepo.find({
          where: { library: { member_id: bookIWant.owner_id } },
          relations: ['library'],
        });

        const myBooksTheyWant: PotentialMatch['myBooksTheyWant'] = [];
        const theirBooksIWant: PotentialMatch['theirBooksIWant'] = [];

        // Sách của tôi mà họ muốn
        for (const theirWant of theirWants) {
          for (const myBook of myAvailableBooks) {
            const score = this.calculateMatchScore(myBook, theirWant);
            if (score.score >= 0.3) {
              myBooksTheyWant.push({ myBook, theirWant, score });
            }
          }
        }

        // Nếu họ muốn >= 1 sách của tôi → hợp lệ
        if (myBooksTheyWant.length > 0) {
          // Ghi nhận cuốn tôi muốn từ họ
          const score = this.calculateMatchScore(bookIWant, myWant);
          theirBooksIWant.push({ theirBook: bookIWant, myWant, score });

          // Tổng điểm
          const totalScore =
            myBooksTheyWant.reduce((sum, m) => sum + m.score.score, 0) +
            theirBooksIWant.reduce((sum, m) => sum + m.score.score, 0);

          // Lấy member đầy đủ
          const otherMember = await this.memberRepo.findOne({
            where: { member_id: bookIWant.owner_id },
            relations: ['user'],
          });

          if (otherMember) {
            potentialMatches.push({
              otherMember,
              myBooksTheyWant,
              theirBooksIWant,
              totalScore,
            });
            processedMembers.add(bookIWant.owner_id);
          }
        }
      }
    }

    // 5) Sort theo điểm
    potentialMatches.sort((a, b) => b.totalScore - a.totalScore);

    // 6) Lưu top 10 suggestion
    const topMatches = potentialMatches.slice(0, 10);
    const savedSuggestions: ReturnType<typeof this.formatSuggestion>[] = [];

    for (const match of topMatches) {
      const suggestion = await this.saveSuggestion(member.member_id, match);
      savedSuggestions.push(this.formatSuggestion(suggestion, match));
    }

    this.logger.log(`[findMatchingSuggestions] Found ${savedSuggestions.length} suggestions`);
    return { suggestions: savedSuggestions, total: savedSuggestions.length };
  }

  /**
   * Lấy danh sách suggestion đã lưu
   */
  async getMySuggestions(userId: string, limit: number = 20) {
    this.logger.log(`[getMySuggestions] userId=${userId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const suggestions = await this.suggestionRepo.find({
      where: { member_a_id: member.member_id },
      relations: ['member_b', 'member_b.user', 'match_pairs', 'match_pairs.book_a', 'match_pairs.book_b'],
      order: { match_score: 'DESC', created_at: 'DESC' },
      take: limit,
    });

    return {
      suggestions: suggestions.map((s) => ({
        suggestion_id: s.suggestion_id,
        match_score: parseFloat(s.match_score.toString()),
        total_matching_books: s.total_matching_books,
        is_viewed: s.is_viewed,
        member: {
          member_id: s.member_b.member_id,
          full_name: s.member_b.user.full_name,
          avatar_url: s.member_b.user.avatar_url,
          region: s.member_b.region,
          trust_score: parseFloat(s.member_b.trust_score.toString()),
          average_rating: parseFloat(s.member_b.average_rating.toString()),
        },
        matching_books: s.match_pairs.map((pair) => ({
          direction: (pair as any).pair_direction ?? undefined, // nếu đã thêm field
          your_book: pair.book_a
            ? {
                book_id: pair.book_a.book_id,
                title: pair.book_a.title,
                author: pair.book_a.author,
                condition: pair.book_a.book_condition,
              }
            : null,
          their_book: pair.book_b
            ? {
                book_id: pair.book_b.book_id,
                title: pair.book_b.title,
                author: pair.book_b.author,
                condition: pair.book_b.book_condition,
              }
            : null,
          match_reason: pair.match_reason,
          match_score: parseFloat(pair.match_score.toString()),
        })),
        created_at: s.created_at,
        viewed_at: s.viewed_at,
      })),
      total: suggestions.length,
    };
  }

  /**
   * Đánh dấu đã xem suggestion
   */
  async markSuggestionViewed(userId: string, suggestionId: string) {
    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const suggestion = await this.suggestionRepo.findOne({
      where: { suggestion_id: suggestionId, member_a_id: member.member_id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    suggestion.is_viewed = true;
    suggestion.viewed_at = new Date();
    await this.suggestionRepo.save(suggestion);

    return { message: 'Suggestion marked as viewed' };
  }

  // ==================== Helpers ====================

  private async findBooksMatchingWant(want: BookWanted, excludeMemberId: string): Promise<Book[]> {
    const query = this.bookRepo
      .createQueryBuilder('book')
      .where('book.status = :status', { status: BookStatus.AVAILABLE })
      .andWhere('book.deleted_at IS NULL')
      .andWhere('book.owner_id != :excludeMemberId', { excludeMemberId });

    if (want.title) {
      query.andWhere('LOWER(book.title) LIKE LOWER(:title)', { title: `%${want.title}%` });
    }
    if (want.author) {
      query.andWhere('LOWER(book.author) LIKE LOWER(:author)', { author: `%${want.author}%` });
    }
    if (want.category) {
      query.andWhere('book.category = :category', { category: want.category });
    }

    return query.getMany();
  }

  private calculateMatchScore(book: Book, want: BookWanted): MatchScore {
    let score = 0;
    const reasons: string[] = [];

    if (book.title.toLowerCase().trim() === want.title.toLowerCase().trim()) {
      score += 0.5;
      reasons.push('Exact title match');
    } else if (
      book.title.toLowerCase().includes(want.title.toLowerCase()) ||
      want.title.toLowerCase().includes(book.title.toLowerCase())
    ) {
      score += 0.3;
      reasons.push('Partial title match');
    }

    if (book.author && want.author) {
      if (book.author.toLowerCase().trim() === want.author.toLowerCase().trim()) {
        score += 0.2;
        reasons.push('Same author');
      } else if (
        book.author.toLowerCase().includes(want.author.toLowerCase()) ||
        want.author.toLowerCase().includes(book.author.toLowerCase())
      ) {
        score += 0.1;
        reasons.push('Similar author');
      }
    }

    if (book.category && want.category && book.category === want.category) {
      score += 0.1;
      reasons.push(`Category: ${book.category}`);
    }

    if (want.priority >= 7) {
      score += 0.1;
      reasons.push('High priority want');
    } else if (want.priority >= 5) {
      score += 0.05;
    }

    if (book.book_condition === 'LIKE_NEW') {
      score += 0.05;
      reasons.push('Excellent condition');
    }

    return { score: Math.min(score, 1.0), reasons };
  }

  private async saveSuggestion(myMemberId: string, match: PotentialMatch): Promise<ExchangeSuggestion> {
    let suggestion = await this.suggestionRepo.findOne({
      where: { member_a_id: myMemberId, member_b_id: match.otherMember.member_id },
    });

    if (suggestion) {
      suggestion.match_score = match.totalScore;
      suggestion.total_matching_books = match.myBooksTheyWant.length + match.theirBooksIWant.length;
      suggestion.is_viewed = false;

      // ĐỪNG gán null trực tiếp cho Date trong TS
      suggestion.viewed_at = undefined as unknown as Date;
    } else {
      suggestion = this.suggestionRepo.create({
        suggestion_id: uuidv4(),
        member_a_id: myMemberId,
        member_b_id: match.otherMember.member_id,
        match_score: match.totalScore,
        total_matching_books: match.myBooksTheyWant.length + match.theirBooksIWant.length,
      });
    }

    suggestion = await this.suggestionRepo.save(suggestion);

    // Xoá cặp cũ rồi ghi mới
    await this.pairRepo.delete({ suggestion_id: suggestion.suggestion_id });

    // THEY_WANT_FROM_ME → có myBook, không có theirBook
    for (const m of match.myBooksTheyWant) {
      const pair = this.pairRepo.create({
        pair_id: uuidv4(),
        suggestion_id: suggestion.suggestion_id,
        book_a_id: m.myBook.book_id,
        book_b_id: null, // PHẢI LÀ NULL
        pair_direction: 'THEY_WANT_FROM_ME',
        match_reason: m.score.reasons.join(', '),
        match_score: m.score.score,
      } as any);
      await this.pairRepo.save(pair);
    }

    // I_WANT_FROM_THEM → có theirBook, không có myBook
    for (const m of match.theirBooksIWant) {
      const pair = this.pairRepo.create({
        pair_id: uuidv4(),
        suggestion_id: suggestion.suggestion_id,
        book_a_id: null, // PHẢI LÀ NULL
        book_b_id: m.theirBook.book_id,
        pair_direction: 'I_WANT_FROM_THEM',
        match_reason: m.score.reasons.join(', '),
        match_score: m.score.score,
      } as any);
      await this.pairRepo.save(pair);
    }

    return suggestion;
  }

  private formatSuggestion(suggestion: ExchangeSuggestion, match: PotentialMatch) {
    return {
      suggestion_id: suggestion.suggestion_id,
      match_score: parseFloat(suggestion.match_score.toString()),
      total_matching_books: suggestion.total_matching_books,
      is_viewed: suggestion.is_viewed,
      member: {
        member_id: match.otherMember.member_id,
        full_name: match.otherMember.user.full_name,
        avatar_url: match.otherMember.user.avatar_url,
        region: match.otherMember.region,
        trust_score: parseFloat(match.otherMember.trust_score.toString()),
        average_rating: parseFloat(match.otherMember.average_rating.toString()),
        completed_exchanges: match.otherMember.completed_exchanges,
      },
      matching_books: {
        they_want_from_me: match.myBooksTheyWant.map((m) => ({
          my_book: {
            book_id: m.myBook.book_id,
            title: m.myBook.title,
            author: m.myBook.author,
            condition: m.myBook.book_condition,
          },
          their_want: {
            title: m.theirWant.title,
            author: m.theirWant.author,
            priority: m.theirWant.priority,
          },
          match_score: m.score.score,
          match_reasons: m.score.reasons,
        })),
        i_want_from_them: match.theirBooksIWant.map((m) => ({
          their_book: {
            book_id: m.theirBook.book_id,
            title: m.theirBook.title,
            author: m.theirBook.author,
            condition: m.theirBook.book_condition,
          },
          my_want: {
            title: m.myWant.title,
            author: m.myWant.author,
            priority: m.myWant.priority,
          },
          match_score: m.score.score,
          match_reasons: m.score.reasons,
        })),
      },
      created_at: suggestion.created_at,
    };
  }
}
