// src/common/services/trust-score.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Exchange, ExchangeStatus } from '../../infrastructure/database/entities/exchange.entity';
import { Review } from '../../infrastructure/database/entities/review.entity';
import { User } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class TrustScoreService {
  private readonly logger = new Logger(TrustScoreService.name);

  constructor(
    @InjectRepository(Member)
    private memberRepo: Repository<Member>,
    @InjectRepository(Exchange)
    private exchangeRepo: Repository<Exchange>,
    @InjectRepository(Review)
    private reviewRepo: Repository<Review>,
    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  /**
   * Calculate trust score for a member based on their activity
   * Formula: base_score + bonuses - penalties
   * 
   * Bonuses:
   * - Completed exchanges: +5 per exchange
   * - Good reviews (4-5 stars): +3 per review
   * - Verified email: +10
   * - Has avatar: +5
   * 
   * Penalties:
   * - User cancelled exchanges: -10 per cancel
   * - Expired exchanges: -5 per expiry
   * - NO_SHOW cancellations: -20 per no-show
   * - Bad reviews (1-2 stars): -15 per review
   */
  async calculateTrustScore(memberId: string): Promise<number> {
    this.logger.log(`[calculateTrustScore] memberId=${memberId}`);

    const member = await this.memberRepo.findOne({
      where: { member_id: memberId },
      relations: ['user'],
    });

    if (!member) {
      this.logger.warn(`Member ${memberId} not found`);
      return 0;
    }

    let score = 50; // Base score

    // BONUSES
    // 1. Completed exchanges (+2 each) - matches increment in confirmExchange
    const completedCount = await this.exchangeRepo.count({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.COMPLETED },
        { member_b_id: memberId, status: ExchangeStatus.COMPLETED },
      ],
    });
    score += completedCount * 2;
    this.logger.debug(`+${completedCount * 2} from ${completedCount} completed exchanges`);

    // 2. Good reviews (4-5 stars, +3 each)
    const goodReviews = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.reviewee_id = :memberId', { memberId })
      .andWhere('review.rating >= 4')
      .getCount();
    score += goodReviews * 3;
    this.logger.debug(`+${goodReviews * 3} from ${goodReviews} good reviews`);

    // 3. Verified email (+10)
    if (member.user?.is_email_verified) {
      score += 10;
      this.logger.debug('+10 for verified email');
    }

    // 4. Has avatar (+5)
    if (member.user?.avatar_url) {
      score += 5;
      this.logger.debug('+5 for having avatar');
    }

    // PENALTIES - Count exchanges cancelled
    // 1. User cancelled exchanges (-10 each)
    const userCancelled = await this.exchangeRepo.count({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.CANCELLED, cancellation_reason: 'USER_CANCELLED' },
        { member_b_id: memberId, status: ExchangeStatus.CANCELLED, cancellation_reason: 'USER_CANCELLED' },
      ],
    });
    score -= userCancelled * 10;
    this.logger.debug(`-${userCancelled * 10} from ${userCancelled} user cancellations`);

    // 2. NO_SHOW cancellations (-20 each) - HARSH PENALTY
    // Member gets penalized when THEY are the one who didn't show up
    const noShowCount = await this.exchangeRepo.count({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.CANCELLED, cancellation_reason: 'NO_SHOW' },
        { member_b_id: memberId, status: ExchangeStatus.CANCELLED, cancellation_reason: 'NO_SHOW' },
      ],
    });
    score -= noShowCount * 20;
    this.logger.debug(`-${noShowCount * 20} from ${noShowCount} NO_SHOW incidents`);

    // 3. BOTH_NO_SHOW - both parties are at fault (-20 each)
    const bothNoShowCount = await this.exchangeRepo.count({
      where: [
        { 
          member_a_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: 'BOTH_NO_SHOW',
        },
        { 
          member_b_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: 'BOTH_NO_SHOW',
        },
      ],
    });
    score -= bothNoShowCount * 20;
    this.logger.debug(`-${bothNoShowCount * 20} from ${bothNoShowCount} BOTH_NO_SHOW incidents`);

    // 4. DISPUTE cancellations (-5 each) - Light penalty pending admin review
    const disputeCount = await this.exchangeRepo.count({
      where: [
        { 
          member_a_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: 'DISPUTE',
        },
        { 
          member_b_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: 'DISPUTE',
        },
      ],
    });
    score -= disputeCount * 5;
    this.logger.debug(`-${disputeCount * 5} from ${disputeCount} DISPUTE incidents`);

    // 6. Bad reviews (1-2 stars, -15 each)
    const badReviews = await this.reviewRepo
      .createQueryBuilder('review')
      .where('review.reviewee_id = :memberId', { memberId })
      .andWhere('review.rating <= 2')
      .getCount();
    score -= badReviews * 15;
    this.logger.debug(`-${badReviews * 15} from ${badReviews} bad reviews`);

    // Ensure score is between 0 and 100
    score = Math.max(0, Math.min(100, score));

    this.logger.log(`Final trust score for ${memberId}: ${score}`);

    return score;
  }

  /**
   * Update trust score for a member and save to database
   */
  async updateTrustScore(memberId: string): Promise<void> {
    const score = await this.calculateTrustScore(memberId);
    
    await this.memberRepo.update(
      { member_id: memberId },
      { trust_score: score },
    );

    this.logger.log(`Updated trust score for ${memberId}: ${score}`);
  }

  /**
   * Batch update trust scores for multiple members
   */
  async batchUpdateTrustScores(memberIds: string[]): Promise<void> {
    this.logger.log(`Batch updating trust scores for ${memberIds.length} members`);
    
    for (const memberId of memberIds) {
      try {
        await this.updateTrustScore(memberId);
      } catch (error) {
        this.logger.error(`Failed to update trust score for ${memberId}:`, error);
      }
    }
  }

  // ============================================================
  // TRUST SCORE RESTRICTIONS & WARNINGS
  // ============================================================

  // Trust Score thresholds (scale 0-100)
  private readonly THRESHOLDS = {
    CRITICAL: 0,      // = 0: Bị chặn hoàn toàn
    VERY_LOW: 20,     // < 20: Không thể tạo exchange
    LOW: 40,          // < 40: Cảnh báo, hạn chế hiển thị
    NORMAL: 50,       // >= 50: Bình thường
  };

  /**
   * Kiểm tra các hạn chế dựa trên Trust Score
   */
  getRestrictions(trustScore: number): {
    canCreateExchange: boolean;
    canSendMessages: boolean;
    canPostBooks: boolean;
    warningLevel: 'none' | 'low' | 'very_low' | 'critical';
    warningMessage: string | null;
  } {
    const score = Number(trustScore) || 0;

    if (score <= this.THRESHOLDS.CRITICAL) {
      return {
        canCreateExchange: false,
        canSendMessages: false,
        canPostBooks: false,
        warningLevel: 'critical',
        warningMessage: 'Tài khoản của bạn đã bị hạn chế hoàn toàn do điểm uy tín bằng 0. Vui lòng liên hệ admin.',
      };
    }

    if (score < this.THRESHOLDS.VERY_LOW) {
      return {
        canCreateExchange: false,
        canSendMessages: true,
        canPostBooks: false,
        warningLevel: 'very_low',
        warningMessage: 'Điểm uy tín của bạn rất thấp. Bạn không thể tạo yêu cầu trao đổi hoặc đăng sách mới.',
      };
    }

    if (score < this.THRESHOLDS.LOW) {
      return {
        canCreateExchange: true,
        canSendMessages: true,
        canPostBooks: true,
        warningLevel: 'low',
        warningMessage: 'Điểm uy tín của bạn thấp. Hãy hoàn thành các giao dịch thành công để cải thiện.',
      };
    }

    return {
      canCreateExchange: true,
      canSendMessages: true,
      canPostBooks: true,
      warningLevel: 'none',
      warningMessage: null,
    };
  }

  /**
   * Kiểm tra có nên hiển thị cảnh báo về người dùng này không (cho người khác xem)
   */
  shouldShowWarningToOthers(trustScore: number): { show: boolean; message: string | null } {
    const score = Number(trustScore) || 0;

    if (score <= this.THRESHOLDS.CRITICAL) {
      return {
        show: true,
        message: '⚠️ Người dùng này có điểm uy tín bằng 0',
      };
    }

    if (score < this.THRESHOLDS.VERY_LOW) {
      return {
        show: true,
        message: '⚠️ Cảnh báo: Người dùng này có điểm uy tín rất thấp',
      };
    }

    if (score < this.THRESHOLDS.LOW) {
      return {
        show: true,
        message: '⚠️ Lưu ý: Người dùng này có điểm uy tín thấp',
      };
    }

    return { show: false, message: null };
  }

  /**
   * Get Trust Score badge info for display
   */
  getTrustBadge(trustScore: number): { label: string; color: string; icon: string } {
    const score = Number(trustScore) || 0;

    if (score >= 80) {
      return { label: 'Rất đáng tin cậy', color: 'green', icon: '🌟' };
    }
    if (score >= 60) {
      return { label: 'Đáng tin cậy', color: 'blue', icon: '✅' };
    }
    if (score >= 40) {
      return { label: 'Bình thường', color: 'gray', icon: '👤' };
    }
    if (score >= 20) {
      return { label: 'Cần cải thiện', color: 'yellow', icon: '⚠️' };
    }
    if (score > 0) {
      return { label: 'Độ tin cậy thấp', color: 'orange', icon: '⚠️' };
    }
    return { label: 'Bị hạn chế', color: 'red', icon: '🚫' };
  }
}
