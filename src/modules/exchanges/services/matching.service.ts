// src/modules/exchanges/services/matching.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull, In, MoreThan, Not } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Book, BookStatus, BookCondition } from '../../../infrastructure/database/entities/book.entity';
import { BookWanted, PreferredCondition } from '../../../infrastructure/database/entities/book-wanted.entity';
import { ExchangeSuggestion } from '../../../infrastructure/database/entities/exchange-suggestion.entity';
import { BookMatchPair } from '../../../infrastructure/database/entities/book-match-pair.entity';
import { ExchangeRequest, ExchangeRequestStatus } from '../../../infrastructure/database/entities/exchange-request.entity';

import {
  MatchScore,
  MatchFactors,
  ComprehensiveMatchScore,
  PotentialMatch,
  MatchingConfig,
} from '../interfaces/matching.interface';

@Injectable()
export class MatchingService {
  private readonly logger = new Logger(MatchingService.name);

  private readonly config: MatchingConfig = {
    minMatchScore: 0.3,
    maxSuggestions: 10,
    maxProcessedMembers: 50,
    suggestionExpirationDays: 7,
    enableGeographicBonus: true,
    enableTrustScoreBonus: true,
  };

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

    @InjectRepository(ExchangeRequest)
    private requestRepo: Repository<ExchangeRequest>,
  ) {}

  /**
   * F-MEM-07: Gợi ý các cặp trao đổi tiềm năng - IMPROVED VERSION
   */
  async findMatchingSuggestions(userId: string) {
    this.logger.log(`[findMatchingSuggestions] Finding matches for userId=${userId}`);

    // 1) Lấy member theo userId
    const member = await this.memberRepo.findOne({
      where: { user_id: userId },
    });
    if (!member) throw new NotFoundException('Member profile not found');

    // 2) Get blocked members list
    const blockedMemberIds = await this.getBlockedMembers(member.member_id);

    // 3) Get members with pending requests
    const excludeMemberIds = await this.getMembersWithPendingRequests(member.member_id);

    // Combine blocked and pending
    const excludeSet = new Set([...blockedMemberIds, ...excludeMemberIds, member.member_id]);

    // 4) Wanted books của tôi (priority desc)
    const myWantedBooks = await this.wantedRepo.find({
      where: { library: { member_id: member.member_id } },
      relations: ['library'],
      order: { priority: 'DESC' },
    });

    this.logger.debug(`[findMatchingSuggestions] Found ${myWantedBooks.length} wanted books`);
    if (myWantedBooks.length === 0) {
      this.logger.debug('[findMatchingSuggestions] No wanted books found');
      return { suggestions: [], total: 0 };
    }

    // 5) Sách AVAILABLE của tôi
    const myAvailableBooks = await this.bookRepo.find({
      where: {
        owner_id: member.member_id,
        status: BookStatus.AVAILABLE,
        deleted_at: IsNull(),
      },
    });

    this.logger.debug(`[findMatchingSuggestions] Found ${myAvailableBooks.length} available books to offer`);
    // HIGH #3: Allow browsing even with 0 books (for new users to explore)
    // Users can see what books others want, helping them decide what to add to library

    // 6) Pre-collect potential owner IDs
    const potentialOwnerIds = new Set<string>();
    this.logger.debug(`[findMatchingSuggestions] Searching through ${myWantedBooks.length} wanted books...`);
    
    for (const myWant of myWantedBooks) {
      if (potentialOwnerIds.size >= this.config.maxProcessedMembers) break;

      this.logger.debug(`[findMatchingSuggestions] Searching for: "${myWant.title}" by "${myWant.author}"`);
      const booksIWant = await this.findBooksMatchingWant(myWant, member.member_id);
      
      booksIWant.forEach((book) => {
        if (!excludeSet.has(book.owner_id)) {
          this.logger.debug(`[findMatchingSuggestions] Found potential match: ${book.title} owned by ${book.owner_id}`);
          potentialOwnerIds.add(book.owner_id);
        } else {
          this.logger.debug(`[findMatchingSuggestions] Excluded owner: ${book.owner_id} (blocked or has pending request)`);
        }
      });
    }

    this.logger.debug(`[findMatchingSuggestions] Total potential owners found: ${potentialOwnerIds.size}`);
    if (potentialOwnerIds.size === 0) {
      this.logger.debug('[findMatchingSuggestions] No potential matches found');
      return { suggestions: [], total: 0 };
    }

    // 7) Batch load potential members
    const potentialMembers = await this.memberRepo.find({
      where: { member_id: In([...potentialOwnerIds]) },
      relations: ['user'],
    });
    const memberMap = new Map(potentialMembers.map((m) => [m.member_id, m]));

    // 8) Batch load their wanted books
    const theirWantedBooksMap = await this.loadWantedBooksForMembers([...potentialOwnerIds]);

    // 9) Two-way matching + comprehensive scoring
    const potentialMatches: PotentialMatch[] = [];
    const processedMembers = new Set<string>();

    for (const myWant of myWantedBooks) {
      if (potentialMatches.length >= this.config.maxProcessedMembers) break;

      const booksIWant = await this.findBooksMatchingWant(myWant, member.member_id);

      for (const bookIWant of booksIWant) {
        if (excludeSet.has(bookIWant.owner_id)) continue;
        if (processedMembers.has(bookIWant.owner_id)) continue;

        const otherMember = memberMap.get(bookIWant.owner_id);
        if (!otherMember) continue;

        const theirWants = theirWantedBooksMap.get(bookIWant.owner_id) || [];

        const myBooksTheyWant: PotentialMatch['myBooksTheyWant'] = [];
        const theirBooksIWant: PotentialMatch['theirBooksIWant'] = [];

        // They want from me
        for (const theirWant of theirWants) {
          for (const myBook of myAvailableBooks) {
            const comprehensiveScore = this.calculateComprehensiveScore(
              myBook,
              theirWant,
              member, // owner of myBook
              otherMember, // requester
            );

            if (comprehensiveScore.score >= this.config.minMatchScore) {
              myBooksTheyWant.push({
                myBook,
                theirWant,
                score: comprehensiveScore,
              });
            }
          }
        }

        // HIGH #2: ONE-WAY SUGGESTIONS - Show if I want their books (even if they don't want mine)
        // This allows users to browse and send requests freely
        
        // I want from them (always add)
        const comprehensiveScore = this.calculateComprehensiveScore(
          bookIWant,
          myWant,
          otherMember, // owner of bookIWant
          member, // requester (me)
        );

        theirBooksIWant.push({
          theirBook: bookIWant,
          myWant,
          score: comprehensiveScore,
        });

        // Check if two-way match exists (for bonus scoring)
        const isTwoWayMatch = myBooksTheyWant.length > 0;
        
        // Total score (if no two-way, only count theirBooksIWant)
        const totalScore = isTwoWayMatch
          ? myBooksTheyWant.reduce((sum, m) => sum + m.score.score, 0) +
            theirBooksIWant.reduce((sum, m) => sum + m.score.score, 0)
          : theirBooksIWant.reduce((sum, m) => sum + m.score.score, 0);

        const scoreBreakdown = this.aggregateScoreBreakdown([
          ...myBooksTheyWant.map((m) => m.score.breakdown),
          ...theirBooksIWant.map((m) => m.score.breakdown),
        ]);

        // Add to suggestions (no longer requires two-way match)
        potentialMatches.push({
          otherMember,
          myBooksTheyWant,
          theirBooksIWant,
          totalScore,
          scoreBreakdown,
        });

        processedMembers.add(bookIWant.owner_id);
      }
    }

    // 10) Sort theo điểm
    potentialMatches.sort((a, b) => b.totalScore - a.totalScore);

    // 11) Lưu top suggestions
    const topMatches = potentialMatches.slice(0, this.config.maxSuggestions);
    const savedSuggestions: ReturnType<typeof this.formatSuggestion>[] = [];

    for (const match of topMatches) {
      const suggestion = await this.saveSuggestion(member.member_id, match);
      savedSuggestions.push(this.formatSuggestion(suggestion, match));
    }

    this.logger.log(`[findMatchingSuggestions] Found ${savedSuggestions.length} suggestions`);
    return { suggestions: savedSuggestions, total: savedSuggestions.length };
  }

  // ========== Helpers: fetch block/pending/wanted ==========

  private async getBlockedMembers(memberId: string): Promise<string[]> {
    try {
      const result = await this.memberRepo.query(
        `
        SELECT blocked_member_id AS member_id FROM blocked_members WHERE blocked_by_id = ?
        UNION
        SELECT blocked_by_id AS member_id FROM blocked_members WHERE blocked_member_id = ?
        `,
        [memberId, memberId],
      );
      return result.map((r: any) => r.member_id);
    } catch (error: any) {
      this.logger.warn(`Failed to get blocked members: ${error.message}`);
      return [];
    }
  }

  private async getMembersWithPendingRequests(memberId: string): Promise<string[]> {
    const pendingRequests = await this.requestRepo.find({
      where: [
        { requester_id: memberId, status: ExchangeRequestStatus.PENDING },
        { receiver_id: memberId, status: ExchangeRequestStatus.PENDING },
      ],
      select: ['requester_id', 'receiver_id'],
    });

    const excludeIds = new Set<string>();
    pendingRequests.forEach((req) => {
      const otherId = req.requester_id === memberId ? req.receiver_id : req.requester_id;
      excludeIds.add(otherId);
    });

    return [...excludeIds];
  }

  private async loadWantedBooksForMembers(memberIds: string[]): Promise<Map<string, BookWanted[]>> {
    if (memberIds.length === 0) return new Map();

    const allWantedBooks = await this.wantedRepo
      .createQueryBuilder('wanted')
      .leftJoinAndSelect('wanted.library', 'library')
      .where('library.member_id IN (:...memberIds)', { memberIds })
      .getMany();

    const map = new Map<string, BookWanted[]>();
    for (const wanted of allWantedBooks) {
      const mid = wanted.library.member_id;
      if (!map.has(mid)) map.set(mid, []);
      map.get(mid)!.push(wanted);
    }
    return map;
  }

  // ========== Query APIs ==========

  async getMySuggestions(userId: string, limit: number = 20) {
    this.logger.log(`[getMySuggestions] userId=${userId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const suggestions = await this.suggestionRepo.find({
      where: {
        member_a_id: member.member_id,
        expired_at: MoreThan(new Date()),
      },
      relations: ['member_b', 'member_b.user', 'match_pairs', 'match_pairs.book_a', 'match_pairs.book_b'],
      order: { match_score: 'DESC', created_at: 'DESC' },
      take: limit,
    });

    return {
      suggestions: suggestions.map((s) => {
        // Group pairs by direction to match generateSuggestions format
        const theyWantFromMe = s.match_pairs
          .filter((pair) => (pair as any).pair_direction === 'THEY_WANT_FROM_ME')
          .map((pair) => ({
            my_book: pair.book_a
              ? {
                  book_id: pair.book_a.book_id,
                  title: pair.book_a.title,
                  author: pair.book_a.author,
                  category: pair.book_a.category,
                  condition: pair.book_a.book_condition,
                  cover_image: pair.book_a.cover_image_url,
                }
              : null,
            their_want: pair.book_b
              ? {
                  // Note: book_b stores wanted book info in pair_direction=THEY_WANT_FROM_ME
                  title: pair.book_b.title,
                  author: pair.book_b.author,
                }
              : null,
            match_score: Number(pair.match_score as any),
            reasons: pair.match_reason ? [pair.match_reason] : [],
          }));

        const iWantFromThem = s.match_pairs
          .filter((pair) => (pair as any).pair_direction === 'I_WANT_FROM_THEM')
          .map((pair) => ({
            their_book: pair.book_b
              ? {
                  book_id: pair.book_b.book_id,
                  title: pair.book_b.title,
                  author: pair.book_b.author,
                  category: pair.book_b.category,
                  condition: pair.book_b.book_condition,
                  cover_image: pair.book_b.cover_image_url,
                }
              : null,
            my_want: pair.book_a
              ? {
                  // Note: book_a stores wanted book info in pair_direction=I_WANT_FROM_THEM
                  title: pair.book_a.title,
                  author: pair.book_a.author,
                }
              : null,
            match_score: Number(pair.match_score as any),
            reasons: pair.match_reason ? [pair.match_reason] : [],
          }));

        return {
          suggestion_id: s.suggestion_id,
          match_score: Number(s.match_score as any),
          total_matching_books: s.total_matching_books,
          is_viewed: s.is_viewed,
          score_breakdown: s.score_breakdown,
          member: {
            member_id: s.member_b.member_id,
            full_name: s.member_b.user?.full_name,
            avatar_url: s.member_b.user?.avatar_url,
            region: s.member_b.region,
            trust_score: Number(s.member_b.trust_score as any),
            average_rating: Number(s.member_b.average_rating as any),
            is_verified: s.member_b.is_verified,
            completed_exchanges: s.member_b.completed_exchanges,
          },
          matching_books: {
            they_want_from_me: theyWantFromMe,
            i_want_from_them: iWantFromThem,
          },
          created_at: s.created_at,
          expired_at: s.expired_at,
          viewed_at: s.viewed_at,
        };
      }),
      total: suggestions.length,
    };
  }

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

  async deleteSuggestion(userId: string, suggestionId: string) {
    const member = await this.memberRepo.findOne({ where: { user_id: userId } });
    if (!member) throw new NotFoundException('Member profile not found');

    const suggestion = await this.suggestionRepo.findOne({
      where: { suggestion_id: suggestionId, member_a_id: member.member_id },
    });
    if (!suggestion) throw new NotFoundException('Suggestion not found');

    await this.suggestionRepo.remove(suggestion);

    return { message: 'Suggestion deleted successfully' };
  }

  // ========== Scoring ==========

  private calculateComprehensiveScore(
    book: Book,
    want: BookWanted,
    bookOwner: Member,
    requester: Member,
  ): ComprehensiveMatchScore {
    const factors: MatchFactors = {
      bookMatch: this.calculateBookMatchScore(book, want),
      trustScore: this.config.enableTrustScoreBonus ? this.calculateTrustScore(bookOwner) : 0,
      exchangeHistory: this.calculateHistoryScore(bookOwner),
      rating: this.calculateRatingScore(bookOwner),
      geographic: this.config.enableGeographicBonus
        ? this.calculateGeographicScore(requester.region, bookOwner.region)
        : 0,
      verification: bookOwner.is_verified ? 0.05 : 0,
      priority: this.calculatePriorityScore(want.priority),
      condition: this.calculateConditionScore(book.book_condition),
    };

    const totalScore = Object.values(factors).reduce((a, b) => a + b, 0);
    const reasons = this.generateReasons(factors, book, want, bookOwner);

    return {
      score: Math.min(totalScore, 1.0),
      breakdown: factors,
      reasons,
    };
  }

  private calculateBookMatchScore(book: Book, want: BookWanted): number {
    let score = 0;

    // Title matching (up to 0.3)
    if (book.title && want.title) {
      const bt = book.title.toLowerCase().trim();
      const wt = want.title.toLowerCase().trim();
      if (bt === wt) score += 0.3;
      else if (bt.includes(wt) || wt.includes(bt)) score += 0.2;
    }

    // Author matching (up to 0.15)
    if (book.author && want.author) {
      const ba = book.author.toLowerCase().trim();
      const wa = want.author.toLowerCase().trim();
      if (ba === wa) score += 0.15;
      else if (ba.includes(wa) || wa.includes(ba)) score += 0.08;
    }

    // Category matching (up to 0.05)
    if (book.category && want.category && book.category === want.category) {
      score += 0.05;
    }

    return score;
  }

  private calculateTrustScore(member: Member): number {
    // Trust score is now on 0-100 scale with adjusted thresholds
    const trust = Number(member.trust_score as any);
    if (trust >= 95) return 0.2;   // VIP: 95-100
    if (trust >= 90) return 0.15;  // Excellent: 90-94
    if (trust >= 80) return 0.1;   // Very good: 80-89
    if (trust >= 60) return 0.0;   // Normal: 60-79
    if (trust < 60) return -0.05;  // Below average: < 60
    return 0;
  }

  private calculateHistoryScore(member: Member): number {
    if (member.completed_exchanges >= 20) return 0.1;
    if (member.completed_exchanges >= 10) return 0.08;
    if (member.completed_exchanges >= 5) return 0.05;
    if (member.completed_exchanges >= 1) return 0.02;
    return 0;
  }

  private calculateRatingScore(member: Member): number {
    const rating = Number(member.average_rating as any);
    if (rating >= 4.8) return 0.08;
    if (rating >= 4.5) return 0.06;
    if (rating >= 4.0) return 0.04;
    if (rating >= 3.5) return 0.02;
    return 0;
  }

  private calculateGeographicScore(myRegion: string, theirRegion: string): number {
    if (!myRegion || !theirRegion) return 0;

    const normalize = (region: string) => region.toLowerCase().trim();
    const my = normalize(myRegion);
    const their = normalize(theirRegion);

    if (my === their) return 0.15;

    const hcmVariants = ['ho chi minh', 'hcm', 'sai gon', 'saigon'];
    const hnVariants = ['ha noi', 'hanoi', 'hn'];
    const dnVariants = ['da nang', 'danang'];

    const isInSameArea = (variants: string[]) =>
      variants.some((v) => my.includes(v)) && variants.some((v) => their.includes(v));

    if (isInSameArea(hcmVariants) || isInSameArea(hnVariants) || isInSameArea(dnVariants)) {
      return 0.1;
    }

    const majorCities = [...hcmVariants, ...hnVariants, ...dnVariants];
    const myInMajor = majorCities.some((city) => my.includes(city));
    const theirInMajor = majorCities.some((city) => their.includes(city));
    if (myInMajor && theirInMajor) return 0.05;

    return 0;
  }

  private calculatePriorityScore(priority: number): number {
    if (priority >= 9) return 0.1;
    if (priority >= 7) return 0.08;
    if (priority >= 5) return 0.05;
    if (priority >= 3) return 0.02;
    return 0;
  }

  private calculateConditionScore(condition: string): number {
    if (!condition) return 0;
    switch (condition) {
      case 'LIKE_NEW':
        return 0.05;
      case 'GOOD':
        return 0.03;
      case 'FAIR':
        return 0.01;
      default:
        return 0;
    }
  }

  private generateReasons(
    factors: MatchFactors,
    book: Book,
    want: BookWanted,
    owner: Member,
  ): string[] {
    const reasons: string[] = [];

    if (factors.bookMatch >= 0.3) reasons.push('Exact title match');
    else if (factors.bookMatch >= 0.2) reasons.push('Partial title match');

    if (book.author && want.author && book.author.toLowerCase() === want.author.toLowerCase()) {
      reasons.push('Same author');
    }

    if (book.category && want.category && book.category === want.category) {
      reasons.push(`Category: ${book.category}`);
    }

    if (factors.trustScore >= 0.1) reasons.push('Highly trusted member');
    if (factors.exchangeHistory >= 0.08) reasons.push('Experienced exchanger');
    if (factors.rating >= 0.06) reasons.push('Excellent ratings');
    if (factors.verification > 0) reasons.push('Verified member');

    if (factors.geographic >= 0.1) reasons.push('Same region');
    else if (factors.geographic >= 0.05) reasons.push('Nearby region');

    if (factors.priority >= 0.08) reasons.push('High priority want');
    if (factors.condition >= 0.05) reasons.push('Excellent condition');

    return reasons;
  }

  /**
   * Aggregate (average) breakdown from multiple matches
   */
  private aggregateScoreBreakdown(breakdowns: MatchFactors[]): MatchFactors {
    if (!breakdowns || breakdowns.length === 0) {
      return {
        bookMatch: 0,
        trustScore: 0,
        exchangeHistory: 0,
        rating: 0,
        geographic: 0,
        verification: 0,
        priority: 0,
        condition: 0,
      };
    }

    const sum = breakdowns.reduce(
      (acc, b) => ({
        bookMatch: acc.bookMatch + (b.bookMatch ?? 0),
        trustScore: acc.trustScore + (b.trustScore ?? 0),
        exchangeHistory: acc.exchangeHistory + (b.exchangeHistory ?? 0),
        rating: acc.rating + (b.rating ?? 0),
        geographic: acc.geographic + (b.geographic ?? 0),
        verification: acc.verification + (b.verification ?? 0),
        priority: acc.priority + (b.priority ?? 0),
        condition: acc.condition + (b.condition ?? 0),
      }),
      {
        bookMatch: 0,
        trustScore: 0,
        exchangeHistory: 0,
        rating: 0,
        geographic: 0,
        verification: 0,
        priority: 0,
        condition: 0,
      },
    );

    const n = breakdowns.length;
    return {
      bookMatch: sum.bookMatch / n,
      trustScore: sum.trustScore / n,
      exchangeHistory: sum.exchangeHistory / n,
      rating: sum.rating / n,
      geographic: sum.geographic / n,
      verification: sum.verification / n,
      priority: sum.priority / n,
      condition: sum.condition / n,
    };
  }

  // ========== Minimal implementations to compile ==========

  /**
   * Helper: Check if book condition meets preferred condition requirement
   */
  private conditionMeetsPreference(bookCondition: BookCondition, preferredCondition: PreferredCondition): boolean {
    if (!preferredCondition || preferredCondition === PreferredCondition.ANY) {
      return true;
    }

    const conditionRank: Record<BookCondition, number> = {
      [BookCondition.LIKE_NEW]: 5,
      [BookCondition.VERY_GOOD]: 4,
      [BookCondition.GOOD]: 3,
      [BookCondition.FAIR]: 2,
      [BookCondition.POOR]: 1,
    };

    const minRequiredRank: Record<PreferredCondition, number> = {
      [PreferredCondition.ANY]: 0,
      [PreferredCondition.FAIR_UP]: 2,
      [PreferredCondition.GOOD_UP]: 3,
      [PreferredCondition.VERY_GOOD_UP]: 4,
      [PreferredCondition.LIKE_NEW]: 5,
    };

    const bookRank = conditionRank[bookCondition] || 0;
    const requiredRank = minRequiredRank[preferredCondition] || 0;

    return bookRank >= requiredRank;
  }

  private async findBooksMatchingWant(myWant: BookWanted, excludeOwnerId: string): Promise<Book[]> {
    this.logger.debug(`[findBooksMatchingWant] Searching for: "${myWant.title}" by "${myWant.author}", ISBN: "${myWant.isbn}", google_books_id: "${myWant.google_books_id}"`);
    
    let results: Book[] = [];

    // 1. PRIORITY 1: Match by ISBN (most accurate)
    if (myWant.isbn) {
      this.logger.debug(`[findBooksMatchingWant] Trying ISBN match: ${myWant.isbn}`);
      const isbnResults = await this.bookRepo.query(
        `SELECT * FROM books 
         WHERE status = ? 
         AND deleted_at IS NULL 
         AND owner_id != ?
         AND isbn = ?
         LIMIT 50`,
        [BookStatus.AVAILABLE, excludeOwnerId, myWant.isbn]
      );
      
      if (isbnResults.length > 0) {
        this.logger.debug(`[findBooksMatchingWant] ISBN match found: ${isbnResults.length} results`);
        results = isbnResults.map(raw => this.bookRepo.create(raw));
      }
    }

    // 2. PRIORITY 2: Match by Google Books ID
    if (results.length === 0 && myWant.google_books_id) {
      this.logger.debug(`[findBooksMatchingWant] Trying Google Books ID match: ${myWant.google_books_id}`);
      const gbResults = await this.bookRepo.query(
        `SELECT * FROM books 
         WHERE status = ? 
         AND deleted_at IS NULL 
         AND owner_id != ?
         AND google_books_id = ?
         LIMIT 50`,
        [BookStatus.AVAILABLE, excludeOwnerId, myWant.google_books_id]
      );
      
      if (gbResults.length > 0) {
        this.logger.debug(`[findBooksMatchingWant] Google Books ID match found: ${gbResults.length} results`);
        results = gbResults.map(raw => this.bookRepo.create(raw));
      }
    }

    // 3. PRIORITY 3: Fuzzy match by title + author
    if (results.length === 0 && myWant.title) {
      this.logger.debug(`[findBooksMatchingWant] Trying fuzzy title/author match`);
      
      // Normalize title: remove punctuation, extra spaces for better matching
      const normalizedTitle = myWant.title
        .toLowerCase()
        .replace(/[,.:;!?()-]/g, ' ')  // Remove punctuation
        .replace(/\s+/g, ' ')           // Collapse multiple spaces
        .trim();
      
      // Split into keywords for flexible matching
      const titleKeywords = normalizedTitle.split(' ').filter(word => word.length > 2);
      
      this.logger.debug(`[findBooksMatchingWant] Normalized title: "${normalizedTitle}", keywords: ${titleKeywords.join(', ')}`);
      
      // Build flexible query using keywords
      let query = `SELECT * FROM books 
         WHERE status = ? 
         AND deleted_at IS NULL 
         AND owner_id != ?`;
      const params: any[] = [BookStatus.AVAILABLE, excludeOwnerId];
      
      // Match if title contains most keywords (more flexible)
      if (titleKeywords.length > 0) {
        const titleConditions = titleKeywords
          .map(() => `LOWER(REPLACE(REPLACE(REPLACE(title, ',', ''), '.', ''), ':', '')) LIKE ?`)
          .join(' AND ');
        query += ` AND (${titleConditions})`;
        titleKeywords.forEach(keyword => params.push(`%${keyword}%`));
      }

      // Add author filter if available
      if (myWant.author) {
        const authorPattern = `%${myWant.author.toLowerCase()}%`;
        query += ` AND LOWER(author) LIKE ?`;
        params.push(authorPattern);
      }

      query += ` LIMIT 100`;

      const rawResults = await this.bookRepo.query(query, params);
      this.logger.debug(`[findBooksMatchingWant] Fuzzy match returned ${rawResults.length} results`);
      results = rawResults.map(raw => this.bookRepo.create(raw));
    }

    // 4. Filter by preferred_condition
    if (myWant.preferred_condition && myWant.preferred_condition !== PreferredCondition.ANY) {
      const beforeFilter = results.length;
      results = results.filter(book => 
        this.conditionMeetsPreference(book.book_condition, myWant.preferred_condition)
      );
      this.logger.debug(`[findBooksMatchingWant] Condition filter: ${beforeFilter} -> ${results.length} (preferred: ${myWant.preferred_condition})`);
    }

    // 5. Filter by language if specified
    if (myWant.language) {
      const beforeFilter = results.length;
      results = results.filter(book => 
        !book.language || book.language.toLowerCase() === myWant.language.toLowerCase()
      );
      this.logger.debug(`[findBooksMatchingWant] Language filter: ${beforeFilter} -> ${results.length} (preferred: ${myWant.language})`);
    }

    return results;
  }

  private async saveSuggestion(memberAId: string, match: PotentialMatch): Promise<ExchangeSuggestion> {
    const pairScores: number[] = [
      ...match.myBooksTheyWant.map(x => x.score.score),
      ...match.theirBooksIWant.map(x => x.score.score),
    ];

    // overallScore chuẩn hoá 0–1: dùng AVERAGE (đề xuất)
    const avg = pairScores.length ? (pairScores.reduce((a,b) => a+b, 0) / pairScores.length) : 0;
    const overallScore = Math.min(1, Math.max(0, avg)); // clamp [0,1]

    const suggestionId = uuidv4();
    
    const suggestion = this.suggestionRepo.create({
      suggestion_id: suggestionId,
      member_a_id: memberAId,
      member_b_id: match.otherMember.member_id,
      match_score: Number(overallScore.toFixed(3)), // <= 1.000 → hợp DECIMAL(4,3)
      total_matching_books: match.myBooksTheyWant.length + match.theirBooksIWant.length,
      is_viewed: false,
      expired_at: new Date(Date.now() + this.config.suggestionExpirationDays * 86400000),
      score_breakdown: {
        book_match: match.scoreBreakdown.bookMatch,
        trust_score: match.scoreBreakdown.trustScore,
        exchange_history: match.scoreBreakdown.exchangeHistory,
        rating: match.scoreBreakdown.rating,
        geographic: match.scoreBreakdown.geographic,
        verification: match.scoreBreakdown.verification,
        priority: match.scoreBreakdown.priority,
        condition: match.scoreBreakdown.condition,
      },
    });

    const savedSuggestion = await this.suggestionRepo.save(suggestion);

    // Save book match pairs
    const pairs: BookMatchPair[] = [];

    // They want from me
    for (const item of match.myBooksTheyWant) {
      const pair = this.pairRepo.create({
        pair_id: uuidv4(),
        suggestion_id: suggestionId,
        book_a_id: item.myBook.book_id,
        book_b_id: null, // For wanted books, we don't store book_id
        match_reason: item.score.reasons.join(', '),
        match_score: Number(item.score.score.toFixed(3)),
        pair_direction: 'THEY_WANT_FROM_ME',
      });
      pairs.push(pair);
    }

    // I want from them
    for (const item of match.theirBooksIWant) {
      const pair = this.pairRepo.create({
        pair_id: uuidv4(),
        suggestion_id: suggestionId,
        book_a_id: null, // For wanted books, we don't store book_id
        book_b_id: item.theirBook.book_id,
        match_reason: item.score.reasons.join(', '),
        match_score: Number(item.score.score.toFixed(3)),
        pair_direction: 'I_WANT_FROM_THEM',
      });
      pairs.push(pair);
    }

    if (pairs.length > 0) {
      await this.pairRepo.save(pairs);
    }

    return savedSuggestion;
  }


  private formatSuggestion(s: ExchangeSuggestion, match: PotentialMatch) {
    // Group by unique book_id and take best match only
    const theyWantMap = new Map<string, typeof match.myBooksTheyWant[0]>();
    for (const item of match.myBooksTheyWant) {
      const existing = theyWantMap.get(item.myBook.book_id);
      if (!existing || item.score.score > existing.score.score) {
        theyWantMap.set(item.myBook.book_id, item);
      }
    }

    const iWantMap = new Map<string, typeof match.theirBooksIWant[0]>();
    for (const item of match.theirBooksIWant) {
      const existing = iWantMap.get(item.theirBook.book_id);
      if (!existing || item.score.score > existing.score.score) {
        iWantMap.set(item.theirBook.book_id, item);
      }
    }

    return {
      suggestion_id: s.suggestion_id,
      match_score: Number((Number(s.match_score) || 0).toFixed(3)),
      total_matching_books: theyWantMap.size + iWantMap.size,
      is_viewed: s.is_viewed,
      score_breakdown: {
        book_match: Number((s.score_breakdown?.book_match || 0).toFixed(3)),
        trust_score: Number((s.score_breakdown?.trust_score || 0).toFixed(3)),
        exchange_history: Number((s.score_breakdown?.exchange_history || 0).toFixed(3)),
        rating: Number((s.score_breakdown?.rating || 0).toFixed(3)),
        geographic: Number((s.score_breakdown?.geographic || 0).toFixed(3)),
        verification: Number((s.score_breakdown?.verification || 0).toFixed(3)),
        priority: Number((s.score_breakdown?.priority || 0).toFixed(3)),
        condition: Number((s.score_breakdown?.condition || 0).toFixed(3)),
      },
      created_at: s.created_at,
      expired_at: s.expired_at,
      viewed_at: s.viewed_at,
      member: {
        member_id: match.otherMember.member_id,
        full_name: match.otherMember.user?.full_name,
        avatar_url: match.otherMember.user?.avatar_url,
        region: match.otherMember.region,
        trust_score: Number((Number(match.otherMember.trust_score) || 0).toFixed(2)),
        average_rating: Number((Number(match.otherMember.average_rating) || 0).toFixed(2)),
        is_verified: match.otherMember.is_verified,
        completed_exchanges: match.otherMember.completed_exchanges,
      },
      matching_books: {
        they_want_from_me: Array.from(theyWantMap.values()).map((x) => ({
          my_book: {
            book_id: x.myBook.book_id,
            title: x.myBook.title,
            author: x.myBook.author,
            category: x.myBook.category,
            condition: x.myBook.book_condition,
            cover_image: x.myBook.cover_image_url,
          },
          their_want: {
            wanted_id: x.theirWant.wanted_id,
            title: x.theirWant.title,
            author: x.theirWant.author,
            category: x.theirWant.category,
            priority: x.theirWant.priority,
          },
          match_score: Number(x.score.score.toFixed(3)),
          reasons: x.score.reasons,
        })),
        i_want_from_them: Array.from(iWantMap.values()).map((x) => ({
          their_book: {
            book_id: x.theirBook.book_id,
            title: x.theirBook.title,
            author: x.theirBook.author,
            category: x.theirBook.category,
            condition: x.theirBook.book_condition,
            cover_image: x.theirBook.cover_image_url,
          },
          my_want: {
            wanted_id: x.myWant.wanted_id,
            title: x.myWant.title,
            author: x.myWant.author,
            category: x.myWant.category,
            priority: x.myWant.priority,
          },
          match_score: Number(x.score.score.toFixed(3)),
          reasons: x.score.reasons,
        })),
      },
    };
  }
}
