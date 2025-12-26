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
   * AI MATCHING ALGORITHM - Tìm gợi ý trao đổi phù hợp
   * Flow chính: 
   * 1. Lấy wanted books của user (sách tôi muốn)
   * 2. Tìm ai có sách đó (available)
   * 3. Kiểm tra 2 chiều: Họ có muốn sách của tôi không?
   * 4. Tính điểm matching (8 factors)
   * 5. Lưu top suggestions vào DB
   */
  async findMatchingSuggestions(userId: string) {
    this.logger.log(`[findMatchingSuggestions] Finding matches for userId=${userId}`);

    const member = await this.memberRepo.findOne({ where: { user_id: userId } }); // Lấy member profile từ DB
    if (!member) throw new NotFoundException('Member profile not found'); // Không tìm thấy → throw error

    const blockedMemberIds = await this.getBlockedMembers(member.member_id); // Lấy danh sách đã chặn (blocked)
    const excludeMemberIds = await this.getMembersWithPendingRequests(member.member_id); // Lấy members có pending request (để tránh gợi ý trùng)
    const excludeSet = new Set([...blockedMemberIds, ...excludeMemberIds, member.member_id]); // Set chứa IDs cần loại trừ

    // Lấy wanted books (sách tôi muốn), sắp xếp theo priority DESC
    const myWantedBooks = await this.wantedRepo.find({
      where: { library: { member_id: member.member_id } },
      relations: ['library'],
      order: { priority: 'DESC' }, // Ưu tiên cao nhất trước
    });

    this.logger.debug(`[findMatchingSuggestions] Found ${myWantedBooks.length} wanted books`);
    if (myWantedBooks.length === 0) return { suggestions: [], total: 0 }; // Không có wanted books → return rỗng

    // Lấy sách AVAILABLE của tôi (để dùng trao đổi)
    const myAvailableBooks = await this.bookRepo.find({
      where: {
        owner_id: member.member_id,
        status: BookStatus.AVAILABLE, // Chỉ lấy sách sẵn sàng
        deleted_at: IsNull(), // Chưa bị xóa
      },
    });

    this.logger.debug(`[findMatchingSuggestions] Found ${myAvailableBooks.length} available books to offer`);

    // Tìm người có sách tôi muốn (potential owners)
    const potentialOwnerIds = new Set<string>(); // Set để tránh duplicate
    this.logger.debug(`[findMatchingSuggestions] Searching through ${myWantedBooks.length} wanted books...`);
    
    for (const myWant of myWantedBooks) {
      if (potentialOwnerIds.size >= this.config.maxProcessedMembers) break; // Giới hạn 50 members

      this.logger.debug(`[findMatchingSuggestions] Searching for: "${myWant.title}" by "${myWant.author}"`);
      const booksIWant = await this.findBooksMatchingWant(myWant, member.member_id); // Tìm sách match (3-priority: ISBN > Google Books ID > Fuzzy)
      
      booksIWant.forEach((book) => {
        if (!excludeSet.has(book.owner_id)) { // Không phải blocked/pending
          this.logger.debug(`[findMatchingSuggestions] Found potential match: ${book.title} owned by ${book.owner_id}`);
          potentialOwnerIds.add(book.owner_id); // Thêm vào Set
        } else {
          this.logger.debug(`[findMatchingSuggestions] Excluded owner: ${book.owner_id} (blocked or has pending request)`);
        }
      });
    }

    this.logger.debug(`[findMatchingSuggestions] Total potential owners found: ${potentialOwnerIds.size}`);
    if (potentialOwnerIds.size === 0) return { suggestions: [], total: 0 }; // Không tìm thấy ai → return rỗng

    // Batch load members (tối ưu query - 1 lần thay vì loop)
    const potentialMembers = await this.memberRepo.find({
      where: { member_id: In([...potentialOwnerIds]) },
      relations: ['user'], // Load luôn user info (name, avatar...)
    });
    const memberMap = new Map(potentialMembers.map((m) => [m.member_id, m])); // Convert sang Map để lookup nhanh O(1)

    // Batch load wanted books của họ (kiểm tra 2 chiều: họ có muốn sách của tôi không?)
    const theirWantedBooksMap = await this.loadWantedBooksForMembers([...potentialOwnerIds]);

    // TWO-WAY MATCHING: Kiểm tra cả 2 chiều và tính điểm
    const potentialMatches: PotentialMatch[] = [];
    const processedMembers = new Set<string>(); // Tránh xử lý 1 member nhiều lần

    for (const myWant of myWantedBooks) {
      if (potentialMatches.length >= this.config.maxProcessedMembers) break; // Giới hạn 50

      const booksIWant = await this.findBooksMatchingWant(myWant, member.member_id); // Sách tôi muốn

      for (const bookIWant of booksIWant) {
        if (excludeSet.has(bookIWant.owner_id)) continue; // Skip blocked/pending
        if (processedMembers.has(bookIWant.owner_id)) continue; // Đã xử lý rồi

        const otherMember = memberMap.get(bookIWant.owner_id); // Lấy member từ Map
        if (!otherMember) continue;

        const theirWants = theirWantedBooksMap.get(bookIWant.owner_id) || []; // Wanted books của họ

        const myBooksTheyWant: PotentialMatch['myBooksTheyWant'] = []; // Sách của tôi mà họ muốn
        const theirBooksIWant: PotentialMatch['theirBooksIWant'] = []; // Sách của họ mà tôi muốn

        // Kiểm tra: Họ có muốn sách của tôi không?
        for (const theirWant of theirWants) {
          for (const myBook of myAvailableBooks) {
            const comprehensiveScore = this.calculateComprehensiveScore(
              myBook,
              theirWant,
              member, // chủ sách (tôi)
              otherMember, // người muốn (họ)
            );

            if (comprehensiveScore.score >= this.config.minMatchScore) { // Điểm >= ngưỡng tối thiểu (VD: 0.3)
              myBooksTheyWant.push({
                myBook,
                theirWant,
                score: comprehensiveScore,
              });
            }
          }
        }

        // ONE-WAY SUGGESTIONS: Hiển thị nếu tôi muốn sách của họ (không bắt buộc 2 chiều)
        
        // Tính điểm sách họ có mà tôi muốn
        const comprehensiveScore = this.calculateComprehensiveScore(
          bookIWant,
          myWant,
          otherMember, // chủ sách (họ)
          member, // người muốn (tôi)
        );

        theirBooksIWant.push({ // Luôn thêm vào (không cần điều kiện)
          theirBook: bookIWant,
          myWant,
          score: comprehensiveScore,
        });

        const isTwoWayMatch = myBooksTheyWant.length > 0; // Có phải match 2 chiều?
        
        // Tổng điểm: Nếu 2 chiều thì cộng 2 bên, không thì chỉ tính theirBooksIWant
        const totalScore = isTwoWayMatch
          ? myBooksTheyWant.reduce((sum, m) => sum + m.score.score, 0) +
            theirBooksIWant.reduce((sum, m) => sum + m.score.score, 0)
          : theirBooksIWant.reduce((sum, m) => sum + m.score.score, 0);

        const scoreBreakdown = this.aggregateScoreBreakdown([ // Tổng hợp điểm từ tất cả cặp sách
          ...myBooksTheyWant.map((m) => m.score.breakdown),
          ...theirBooksIWant.map((m) => m.score.breakdown),
        ]);

        potentialMatches.push({ // Thêm vào danh sách suggestions
          otherMember,
          myBooksTheyWant,
          theirBooksIWant,
          totalScore,
          scoreBreakdown,
        });

        processedMembers.add(bookIWant.owner_id); // Đánh dấu đã xử lý
      }
    }

    potentialMatches.sort((a, b) => b.totalScore - a.totalScore); // Sắp xếp giảm dần theo điểm

    const topMatches = potentialMatches.slice(0, this.config.maxSuggestions); // Lấy top 20 (default)
    const savedSuggestions: ReturnType<typeof this.formatSuggestion>[] = [];

    // Lưu vào database
    for (const match of topMatches) {
      const suggestion = await this.saveSuggestion(member.member_id, match); // Lưu vào matching_suggestions
      savedSuggestions.push(this.formatSuggestion(suggestion, match)); // Format trả về cho frontend
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
        `, // Bi-directional: Lấy cả người tôi chặn và người chặn tôi
        [memberId, memberId],
      );
      return result.map((r: any) => r.member_id); // Trả về array các member_id
    } catch (error: any) {
      this.logger.warn(`Failed to get blocked members: ${error.message}`);
      return []; // Lỗi thì return rỗng
    }
  }

  private async getMembersWithPendingRequests(memberId: string): Promise<string[]> {
    const pendingRequests = await this.requestRepo.find({ // Lấy requests đang pending
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

  /**
   * Tính điểm matching tổng hợp (8 factors)
   * Weighted scoring:
   * 1. Book Match (0.3) - Sách có match không (ISBN, title, author)
   * 2. Trust Score (0.2) - Độ tin cậy (0-100 scale)
   * 3. Geographic (0.15) - Cùng khu vực (giao dịch dễ hơn)
   * 4. History (0.1) - Số lần trao đổi thành công
   * 5. Rating (0.08) - Đánh giá trung bình
   * 6. Priority (0.1) - Độ ưu tiên wanted book (1-10)
   * 7. Condition (0.05) - Tình trạng sách
   * 8. Verification (0.05) - Email/Phone verified
   */
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

  /**
   * Tính điểm khớp sách (max 0.5 = 50%)
   * - Title exact match: 0.3
   * - Title partial: 0.2
   * - Author exact: 0.15
   * - Author partial: 0.08
   * - Category match: 0.05
   */
  private calculateBookMatchScore(book: Book, want: BookWanted): number {
    let score = 0;

    // Title matching (up to 0.3)
    if (book.title && want.title) {
      const bt = book.title.toLowerCase().trim(); // Normalize title của book
      const wt = want.title.toLowerCase().trim(); // Normalize title của wanted
      if (bt === wt) score += 0.3; // Tên chính xác 100% → 0.3 điểm
      else if (bt.includes(wt) || wt.includes(bt)) score += 0.2; // Chứa nhau → 0.2 điểm
    }

    // Author matching (up to 0.15)
    if (book.author && want.author) {
      const ba = book.author.toLowerCase().trim(); // Normalize author của book
      const wa = want.author.toLowerCase().trim(); // Normalize author của wanted
      if (ba === wa) score += 0.15; // Tác giả chính xác → 0.15 điểm
      else if (ba.includes(wa) || wa.includes(ba)) score += 0.08; // Chứa nhau → 0.08 điểm
    }

    // Category matching (up to 0.05)
    if (book.category && want.category && book.category === want.category) {
      score += 0.05; // Thể loại giống nhau → 0.05 điểm
    }

    return score; // Tổng điểm (max 0.5)
  }

  /**
   * Trust score (0-100 scale) → Bonus/penalty
   * 95-100: +0.2 (VIP)
   * 90-94: +0.15 (Excellent)
   * 80-89: +0.1 (Very good)
   * 60-79: 0 (Normal)
   * <60: -0.05 (Below average - penalty)
   */
  private calculateTrustScore(member: Member): number {
    const trust = Number(member.trust_score as any); // Trust score scale 0-100
    if (trust >= 95) return 0.2;   // VIP: 95-100 → +0.2
    if (trust >= 90) return 0.15;  // Excellent: 90-94 → +0.15
    if (trust >= 80) return 0.1;   // Very good: 80-89 → +0.1
    if (trust >= 60) return 0.0;   // Normal: 60-79 → 0 (neutral)
    if (trust < 60) return -0.05;  // Below average: < 60 → -0.05 (penalty)
    return 0;
  }

  private calculateHistoryScore(member: Member): number {
    if (member.completed_exchanges >= 20) return 0.1;  // 20+ giao dịch → 0.1
    if (member.completed_exchanges >= 10) return 0.08; // 10-19 giao dịch → 0.08
    if (member.completed_exchanges >= 5) return 0.05;  // 5-9 giao dịch → 0.05
    if (member.completed_exchanges >= 1) return 0.02;  // 1-4 giao dịch → 0.02
    return 0; // Chưa có giao dịch → 0
  }

  private calculateRatingScore(member: Member): number {
    const rating = Number(member.average_rating as any); // Đánh giá trung bình (1-5)
    if (rating >= 4.8) return 0.08; // 4.8-5.0 → 0.08
    if (rating >= 4.5) return 0.06; // 4.5-4.7 → 0.06
    if (rating >= 4.0) return 0.04; // 4.0-4.4 → 0.04
    if (rating >= 3.5) return 0.02; // 3.5-3.9 → 0.02
    return 0; // < 3.5 → 0
  }

  /**
   * Geographic proximity score (max 0.15)
   * - Cùng region: 0.15
   * - Cùng major city (HCM/HN/DN): 0.1
   * - Cả 2 đều major cities: 0.05
   * - Khác region: 0
   */
  private calculateGeographicScore(myRegion: string, theirRegion: string): number {
    if (!myRegion || !theirRegion) return 0; // Thiếu thông tin → 0

    const normalize = (region: string) => region.toLowerCase().trim();
    const my = normalize(myRegion); // Normalize region của tôi
    const their = normalize(theirRegion); // Normalize region của họ

    if (my === their) return 0.15; // Cùng region chính xác → 0.15

    // Định nghĩa major cities (HCM, Hà Nội, Đà Nẵng)
    const hcmVariants = ['ho chi minh', 'hcm', 'sai gon', 'saigon'];
    const hnVariants = ['ha noi', 'hanoi', 'hn'];
    const dnVariants = ['da nang', 'danang'];

    // Kiểm tra cùng major city
    const isInSameArea = (variants: string[]) =>
      variants.some((v) => my.includes(v)) && variants.some((v) => their.includes(v));

    if (isInSameArea(hcmVariants) || isInSameArea(hnVariants) || isInSameArea(dnVariants)) {
      return 0.1; // Cùng thành phố lớn → 0.1
    }

    // Cả 2 đều ở major cities (nhưng khác city)
    const majorCities = [...hcmVariants, ...hnVariants, ...dnVariants];
    const myInMajor = majorCities.some((city) => my.includes(city));
    const theirInMajor = majorCities.some((city) => their.includes(city));
    if (myInMajor && theirInMajor) return 0.05; // Cả 2 major cities → 0.05

    return 0; // Khác region, không match → 0
  }

  private calculatePriorityScore(priority: number): number {
    if (priority >= 9) return 0.1;   // Priority 9-10 → 0.1
    if (priority >= 7) return 0.08;  // Priority 7-8 → 0.08
    if (priority >= 5) return 0.05;  // Priority 5-6 → 0.05
    if (priority >= 3) return 0.02;  // Priority 3-4 → 0.02
    return 0; // Priority < 3 → 0
  }

  private calculateConditionScore(condition: string): number {
    if (!condition) return 0; // Không có thông tin → 0
    switch (condition) {
      case 'LIKE_NEW':
        return 0.05; // Như mới → 0.05
      case 'GOOD':
        return 0.03; // Tốt → 0.03
      case 'FAIR':
        return 0.01; // Trung bình → 0.01
      default:
        return 0; // POOR hoặc khác → 0
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

    // PRIORITY 1: Match by ISBN (chính xác nhất)
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
        results = isbnResults.map(raw => this.bookRepo.create(raw)); // Convert raw SQL → Entity
      }
    }

    // PRIORITY 2: Match by Google Books ID (nếu không có ISBN)
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

    // PRIORITY 3: Fuzzy match by title + author (nếu 2 cái trên không match)
    if (results.length === 0 && myWant.title) {
      this.logger.debug(`[findBooksMatchingWant] Trying fuzzy title/author match`);
      
      // Normalize title: bỏ dấu câu, khoảng trắng dư để match tốt hơn
      const normalizedTitle = myWant.title
        .toLowerCase()
        .replace(/[,.:;!?()-]/g, ' ')  // Bỏ dấu câu
        .replace(/\s+/g, ' ')           // Gộp nhiều spaces thành 1
        .trim();
      
      const titleKeywords = normalizedTitle.split(' ').filter(word => word.length > 2); // Tách thành keywords (bỏ từ < 3 ký tự)
      
      this.logger.debug(`[findBooksMatchingWant] Normalized title: "${normalizedTitle}", keywords: ${titleKeywords.join(', ')}`);
      
      // Build query linh hoạt dùng keywords
      let query = `SELECT * FROM books 
         WHERE status = ? 
         AND deleted_at IS NULL 
         AND owner_id != ?`;
      const params: any[] = [BookStatus.AVAILABLE, excludeOwnerId];
      
      // Match nếu title chứa hầu hết keywords
      if (titleKeywords.length > 0) {
        const titleConditions = titleKeywords
          .map(() => `LOWER(REPLACE(REPLACE(REPLACE(title, ',', ''), '.', ''), ':', '')) LIKE ?`)
          .join(' AND ');
        query += ` AND (${titleConditions})`;
        titleKeywords.forEach(keyword => params.push(`%${keyword}%`)); // Thêm % để LIKE search
      }

      // Thêm filter author nếu có
      if (myWant.author) {
        const authorPattern = `%${myWant.author.toLowerCase()}%`;
        query += ` AND LOWER(author) LIKE ?`;
        params.push(authorPattern);
      }

      query += ` LIMIT 100`; // Giới hạn 100 results

      const rawResults = await this.bookRepo.query(query, params);
      this.logger.debug(`[findBooksMatchingWant] Fuzzy match returned ${rawResults.length} results`);
      results = rawResults.map(raw => this.bookRepo.create(raw));
    }

    // Filter theo preferred_condition (VD: chỉ muốn GOOD trở lên)
    if (myWant.preferred_condition && myWant.preferred_condition !== PreferredCondition.ANY) {
      const beforeFilter = results.length;
      results = results.filter(book => 
        this.conditionMeetsPreference(book.book_condition, myWant.preferred_condition)
      );
      this.logger.debug(`[findBooksMatchingWant] Condition filter: ${beforeFilter} -> ${results.length} (preferred: ${myWant.preferred_condition})`);
    }

    // Filter theo language nếu đã chỉ định
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
