// src/common/services/trust-score.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Exchange, ExchangeStatus, CancellationReason } from '../../infrastructure/database/entities/exchange.entity';
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
    // 1. Completed exchanges (+5 each)
    const completedCount = await this.exchangeRepo.count({
      where: [
        { member_a_id: memberId, status: ExchangeStatus.COMPLETED },
        { member_b_id: memberId, status: ExchangeStatus.COMPLETED },
      ],
    });
    score += completedCount * 5;
    this.logger.debug(`+${completedCount * 5} from ${completedCount} completed exchanges`);

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

    // PENALTIES - Only count violations by THIS member (cancelled_by field)
    // 1. User cancelled exchanges (-10 each)
    const userCancelled = await this.exchangeRepo.count({
      where: {
        cancelled_by: memberId,
        status: ExchangeStatus.CANCELLED,
        cancellation_reason: CancellationReason.USER_CANCELLED,
      },
    });
    score -= userCancelled * 10;
    this.logger.debug(`-${userCancelled * 10} from ${userCancelled} user cancellations`);

    // 2. NO_SHOW cancellations (-20 each) - HARSH PENALTY
    // Member gets penalized when THEY are the one who didn't show up
    // This means: member is in the exchange BUT is NOT the canceller
    const noShowAsA = await this.exchangeRepo
      .createQueryBuilder('exchange')
      .where('exchange.member_a_id = :memberIdA', { memberIdA: memberId })
      .andWhere('exchange.status = :statusA', { statusA: ExchangeStatus.CANCELLED })
      .andWhere('exchange.cancellation_reason = :reasonA', { reasonA: CancellationReason.NO_SHOW })
      .andWhere('exchange.cancelled_by != :memberIdA2', { memberIdA2: memberId }) // Other person reported
      .getCount();
      
    const noShowAsB = await this.exchangeRepo
      .createQueryBuilder('exchange')
      .where('exchange.member_b_id = :memberIdB', { memberIdB: memberId })
      .andWhere('exchange.status = :statusB', { statusB: ExchangeStatus.CANCELLED })
      .andWhere('exchange.cancellation_reason = :reasonB', { reasonB: CancellationReason.NO_SHOW })
      .andWhere('exchange.cancelled_by != :memberIdB2', { memberIdB2: memberId }) // Other person reported
      .getCount();
      
    const noShowCount = noShowAsA + noShowAsB;
    score -= noShowCount * 20;
    this.logger.debug(`-${noShowCount * 20} from ${noShowCount} NO_SHOW incidents (was reported by others)`);

    // 3. BOTH_NO_SHOW - both parties are at fault (-20 each)
    const bothNoShowCount = await this.exchangeRepo.count({
      where: [
        { 
          member_a_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: CancellationReason.BOTH_NO_SHOW,
        },
        { 
          member_b_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: CancellationReason.BOTH_NO_SHOW,
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
          cancellation_reason: CancellationReason.DISPUTE,
        },
        { 
          member_b_id: memberId, 
          status: ExchangeStatus.CANCELLED,
          cancellation_reason: CancellationReason.DISPUTE,
        },
      ],
    });
    score -= disputeCount * 5;
    this.logger.debug(`-${disputeCount * 5} from ${disputeCount} DISPUTE incidents`);

    // 5. Expired exchanges (-5 each, but only if user didn't confirm) but only if user didn't confirm)
    const expiredAsA = await this.exchangeRepo.count({
      where: {
        member_a_id: memberId,
        status: ExchangeStatus.EXPIRED,
        member_a_confirmed: false, // Only count if user A didn't confirm
      },
    });
    const expiredAsB = await this.exchangeRepo.count({
      where: {
        member_b_id: memberId,
        status: ExchangeStatus.EXPIRED,
        member_b_confirmed: false, // Only count if user B didn't confirm
      },
    });
    const expiredCount = expiredAsA + expiredAsB;
    score -= expiredCount * 5;
    this.logger.debug(
      `-${expiredCount * 5} from ${expiredCount} expired exchanges (didn't confirm)`
    );

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
}
