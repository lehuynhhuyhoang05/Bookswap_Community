import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Review } from '../../../infrastructure/database/entities/review.entity';
import { Exchange, ExchangeStatus } from '../../../infrastructure/database/entities/exchange.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Exchange) private readonly exchangeRepo: Repository<Exchange>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    private readonly dataSource: DataSource,
  ) {}

  private clampTrust(v: number) {
    // Clamp trust score to 0-100 range
    if (v < 0) return 0;
    if (v > 100) return 100;
    return Number(v.toFixed(2));
  }

  private trustDeltaFromRating(rating: number) {
    // Trust score impact on 0-100 scale
    switch (rating) {
      case 5:
        return 1.0;  // +1 point for 5-star review
      case 4:
        return 0.5;  // +0.5 point for 4-star review
      case 3:
        return 0.0;  // No change for 3-star review
      case 2:
        return -0.5; // -0.5 point for 2-star review
      case 1:
        return -1.0; // -1 point for 1-star review
      default:
        return 0;
    }
  }

  async create(dto: CreateReviewDto) {
    return this.dataSource.transaction(async (manager) => {
      const exchange = await manager.findOne(Exchange, { where: { exchange_id: dto.exchange_id } });
      if (!exchange) throw new NotFoundException('Exchange not found');
      if (exchange.status !== ExchangeStatus.COMPLETED) {
        throw new BadRequestException('Can only review completed exchanges');
      }

      // Resolve reviewee identifier: allow UUID or username/email/full_name
      let resolvedRevieweeId = dto.reviewee_id;
      const uuidRegex = /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(String(dto.reviewee_id))) {
        // try to resolve by user's email or full_name
        const memberFound = await manager
          .createQueryBuilder(Member, 'm')
          .innerJoinAndSelect('m.user', 'u')
          .where('u.email = :ident OR u.full_name = :ident', { ident: dto.reviewee_id })
          .getOne();
        if (!memberFound) {
          throw new BadRequestException('Reviewee not found');
        }
        resolvedRevieweeId = memberFound.member_id;
      }

      // Validate reviewer/reviewee are participants
      // For development flexibility, allow skipping strict participant checks by setting
      // environment variable REVIEWS_RELAX_PARTICIPANTS=1. Default: strict mode ON.
      const relax = process.env.REVIEWS_RELAX_PARTICIPANTS === '1';
      const reviewerId = dto.reviewer_id ?? '';
      if (!relax) {
        if (![exchange.member_a_id, exchange.member_b_id].includes(reviewerId)) {
          throw new BadRequestException('Reviewer is not part of the exchange');
        }
        if (![exchange.member_a_id, exchange.member_b_id].includes(resolvedRevieweeId)) {
          throw new BadRequestException('Reviewee is not part of the exchange');
        }
      } else {
        Logger.warn(`REVIEWS_RELAX_PARTICIPANTS=1, skipping participant membership checks for exchange ${dto.exchange_id}`);
      }

      // Ensure unique per exchange per reviewer handled by DB unique index; pre-check to give nicer error
  const exists = await manager.findOne(Review, { where: { exchange_id: dto.exchange_id, reviewer_id: reviewerId } });
      if (exists) throw new BadRequestException('You have already reviewed this exchange');

      const review = manager.create(Review, {
        exchange_id: dto.exchange_id,
        reviewer_id: reviewerId,
        reviewee_id: resolvedRevieweeId,
        rating: dto.rating,
        comment: dto.comment,
        trust_score_impact: this.trustDeltaFromRating(dto.rating),
      });

      await manager.save(Review, review);

      // Recalculate stats for reviewee
      await this.recalculateStatsForMember(dto.reviewee_id, manager);

      return review;
    });
  }

  async recalculateStatsForMember(memberId: string, managerOrRepo?: any) {
    const manager = managerOrRepo || this.dataSource.manager;
    const { avg, cnt } = await manager
      .createQueryBuilder(Review, 'r')
      .select('AVG(r.rating)', 'avg')
      .addSelect('COUNT(1)', 'cnt')
      .where('r.reviewee_id = :memberId', { memberId })
      .getRawOne();

    const average = Number(Number(avg || 0).toFixed(1));
    const total = Number(cnt || 0);

    const member = await manager.findOne(Member, { where: { member_id: memberId } });
    if (!member) throw new NotFoundException('Member not found');

    // For trust_score, we'll compute sum of deltas and clamp
    const { sum } = await manager
      .createQueryBuilder(Review, 'r')
      .select('SUM(r.trust_score_impact)', 'sum')
      .where('r.reviewee_id = :memberId', { memberId })
      .getRawOne();

    const trustBase = 50; // Base trust score on 0-100 scale
    const totalDelta = Number(sum || 0) + 0; // sum of impacts
    const newTrust = this.clampTrust(trustBase + totalDelta);

    member.average_rating = average;
    member.trust_score = newTrust;

    await manager.save(Member, member);
    return { average, total, trust_score: newTrust };
  }

  async findByMember(memberId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { reviewee_id: memberId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    return { items, total, page, pageSize };
  }

  /**
   * Get reviews written by a member (as reviewer)
   */
  async findByReviewer(reviewerId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.reviewRepo.findAndCount({
      where: { reviewer_id: reviewerId },
      order: { created_at: 'DESC' },
      skip: (page - 1) * pageSize,
      take: pageSize,
    });
    
    const totalPages = Math.ceil(total / pageSize);
    
    return { 
      items, 
      pagination: {
        total, 
        page, 
        pageSize,
        totalPages
      }
    };
  }

  async findByExchange(exchangeId: string) {
    return this.reviewRepo.find({ where: { exchange_id: exchangeId } });
  }

  async update(reviewId: string, dto: UpdateReviewDto) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, { where: { review_id: reviewId } });
      if (!review) throw new NotFoundException('Review not found');

      if (dto.rating !== undefined) {
        review.rating = dto.rating;
        review.trust_score_impact = this.trustDeltaFromRating(dto.rating);
      }
      if (dto.comment !== undefined) review.comment = dto.comment;

      await manager.save(Review, review);
      await this.recalculateStatsForMember(review.reviewee_id, manager);
      return review;
    });
  }

  async remove(reviewId: string) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, { where: { review_id: reviewId } });
      if (!review) throw new NotFoundException('Review not found');
      await manager.remove(Review, review);
      await this.recalculateStatsForMember(review.reviewee_id, manager);
      return { success: true };
    });
  }

  async statsForMember(memberId: string) {
    const { average, total, trust_score } = await this.recalculateStatsForMember(memberId);
    return { member_id: memberId, average_rating: average, total_reviews: total, trust_score };
  }
}
