import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  Exchange,
  ExchangeStatus,
} from '../../../infrastructure/database/entities/exchange.entity';
import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Review } from '../../../infrastructure/database/entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectRepository(Review) private readonly reviewRepo: Repository<Review>,
    @InjectRepository(Exchange)
    private readonly exchangeRepo: Repository<Exchange>,
    @InjectRepository(Member) private readonly memberRepo: Repository<Member>,
    private readonly dataSource: DataSource,
  ) {}

  private clampTrust(v: number) {
    if (v < 0) return 0;
    if (v > 5) return 5;
    return Number(v.toFixed(2));
  }

  private trustDeltaFromRating(rating: number) {
    switch (rating) {
      case 5:
        return 0.1;
      case 4:
        return 0.05;
      case 3:
        return 0.0;
      case 2:
        return -0.05;
      case 1:
        return -0.1;
      default:
        return 0;
    }
  }

  async create(dto: CreateReviewDto) {
    return this.dataSource.transaction(async (manager) => {
      const exchange = await manager.findOne(Exchange, {
        where: { exchange_id: dto.exchange_id },
      });
      if (!exchange) throw new NotFoundException('Exchange not found');
      if (exchange.status !== ExchangeStatus.COMPLETED) {
        throw new BadRequestException('Can only review completed exchanges');
      }

      // Resolve reviewee identifier: allow UUID or username/email/full_name
      let resolvedRevieweeId = dto.reviewee_id;
      const uuidRegex =
        /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/;
      if (!uuidRegex.test(String(dto.reviewee_id))) {
        // try to resolve by user's email or full_name
        const memberFound = await manager
          .createQueryBuilder(Member, 'm')
          .innerJoinAndSelect('m.user', 'u')
          .where('u.email = :ident OR u.full_name = :ident', {
            ident: dto.reviewee_id,
          })
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
        if (
          ![exchange.member_a_id, exchange.member_b_id].includes(reviewerId)
        ) {
          throw new BadRequestException('Reviewer is not part of the exchange');
        }
        if (
          ![exchange.member_a_id, exchange.member_b_id].includes(
            resolvedRevieweeId,
          )
        ) {
          throw new BadRequestException('Reviewee is not part of the exchange');
        }
      } else {
        Logger.warn(
          `REVIEWS_RELAX_PARTICIPANTS=1, skipping participant membership checks for exchange ${dto.exchange_id}`,
        );
      }

      // Ensure unique per exchange per reviewer handled by DB unique index; pre-check to give nicer error
      const exists = await manager.findOne(Review, {
        where: { exchange_id: dto.exchange_id, reviewer_id: reviewerId },
      });
      if (exists)
        throw new BadRequestException(
          'You have already reviewed this exchange',
        );

      const review = manager.create(Review, {
        exchange_id: dto.exchange_id,
        reviewer_id: reviewerId,
        reviewee_id: resolvedRevieweeId,
        rating: dto.rating,
        comment: dto.comment,
        trust_score_impact: this.trustDeltaFromRating(dto.rating),
      });

      await manager.save(Review, review);

      // Cập nhật flag member_a_reviewed hoặc member_b_reviewed
      if (reviewerId === exchange.member_a_id) {
        exchange.member_a_reviewed = true;
      } else if (reviewerId === exchange.member_b_id) {
        exchange.member_b_reviewed = true;
      }
      await manager.save(Exchange, exchange);

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

    const member = await manager.findOne(Member, {
      where: { member_id: memberId },
    });
    if (!member) throw new NotFoundException('Member not found');

    // For trust_score, we'll compute sum of deltas and clamp
    const { sum } = await manager
      .createQueryBuilder(Review, 'r')
      .select('SUM(r.trust_score_impact)', 'sum')
      .where('r.reviewee_id = :memberId', { memberId })
      .getRawOne();

    const trustBase = 0.5; // as design note earlier; but existing member.trust_score may be legacy. We'll apply sum to 0.5
    const totalDelta = Number(sum || 0) + 0; // sum of impacts
    const newTrust = this.clampTrust(trustBase + totalDelta);

    member.average_rating = average;
    member.trust_score = newTrust;

    await manager.save(Member, member);
    return { average, total, trust_score: newTrust };
  }

  async findByMember(memberId: string, page = 1, pageSize = 20) {
    const [items, total] = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('reviewer.user', 'reviewerUser')
      .where('review.reviewee_id = :memberId', { memberId })
      .orderBy('review.created_at', 'DESC')
      .skip((page - 1) * pageSize)
      .take(pageSize)
      .getManyAndCount();

    // Map để thêm reviewer_name vào response
    const itemsWithName = items.map((item) => ({
      ...item,
      reviewer_name:
        item.reviewer?.user?.full_name || item.reviewer?.user?.email || null,
    }));

    return { items: itemsWithName, total, page, pageSize };
  }

  async findByExchange(exchangeId: string) {
    const items = await this.reviewRepo
      .createQueryBuilder('review')
      .leftJoinAndSelect('review.reviewer', 'reviewer')
      .leftJoinAndSelect('reviewer.user', 'reviewerUser')
      .where('review.exchange_id = :exchangeId', { exchangeId })
      .orderBy('review.created_at', 'DESC')
      .getMany();

    // Map để thêm reviewer_name vào response
    return items.map((item) => ({
      ...item,
      reviewer_name:
        item.reviewer?.user?.full_name || item.reviewer?.user?.email || null,
    }));
  }

  async update(reviewId: string, dto: UpdateReviewDto) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, {
        where: { review_id: reviewId },
      });
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

  async updateWithAuth(reviewId: string, dto: UpdateReviewDto, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, {
        where: { review_id: reviewId },
      });
      if (!review) throw new NotFoundException('Review not found');

      // Resolve member_id from userId (có thể là user_id hoặc member_id)
      let memberId = userId;
      const member = await manager.findOne(Member, {
        where: [{ member_id: userId }, { user_id: userId }],
      });
      if (member) {
        memberId = member.member_id;
      }

      // DEBUG: Log to check authorization
      Logger.log(`[updateWithAuth] reviewId=${reviewId}`);
      Logger.log(`[updateWithAuth] userId from JWT=${userId}`);
      Logger.log(`[updateWithAuth] resolved memberId=${memberId}`);
      Logger.log(`[updateWithAuth] review.reviewer_id=${review.reviewer_id}`);
      Logger.log(`[updateWithAuth] Match: ${review.reviewer_id === memberId}`);

      // Kiểm tra quyền - chỉ reviewer có thể sửa review của họ
      if (review.reviewer_id !== memberId) {
        throw new ForbiddenException(
          'You do not have permission to update this review',
        );
      }

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
      const review = await manager.findOne(Review, {
        where: { review_id: reviewId },
      });
      if (!review) throw new NotFoundException('Review not found');
      await manager.remove(Review, review);
      await this.recalculateStatsForMember(review.reviewee_id, manager);
      return { success: true };
    });
  }

  async removeWithAuth(reviewId: string, userId: string) {
    return this.dataSource.transaction(async (manager) => {
      const review = await manager.findOne(Review, {
        where: { review_id: reviewId },
      });
      if (!review) throw new NotFoundException('Review not found');

      // Resolve member_id from userId (có thể là user_id hoặc member_id)
      let memberId = userId;
      const member = await manager.findOne(Member, {
        where: [{ member_id: userId }, { user_id: userId }],
      });
      if (member) {
        memberId = member.member_id;
      }

      // Kiểm tra quyền - chỉ reviewer có thể xóa review của họ
      if (review.reviewer_id !== memberId) {
        throw new ForbiddenException(
          'You do not have permission to delete this review',
        );
      }

      // Lấy exchange để cập nhật flag
      const exchange = await manager.findOne(Exchange, {
        where: { exchange_id: review.exchange_id },
      });

      await manager.remove(Review, review);

      // Cập nhật flag member_reviewed về false
      if (exchange) {
        if (review.reviewer_id === exchange.member_a_id) {
          exchange.member_a_reviewed = false;
        } else if (review.reviewer_id === exchange.member_b_id) {
          exchange.member_b_reviewed = false;
        }
        await manager.save(Exchange, exchange);
      }

      await this.recalculateStatsForMember(review.reviewee_id, manager);
      return { success: true };
    });
  }

  async statsForMember(memberId: string) {
    const { average, total, trust_score } =
      await this.recalculateStatsForMember(memberId);

    // Tính phân bố đánh giá theo rating 1-5
    const distribution = await this.reviewRepo
      .createQueryBuilder('review')
      .select('review.rating', 'rating')
      .addSelect('COUNT(*)', 'count')
      .where('review.reviewee_id = :memberId', { memberId })
      .groupBy('review.rating')
      .getRawMany();

    // Chuyển đổi thành object {1: 0, 2: 0, 3: 0, 4: 0, 5: 0}
    const ratings_count = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    distribution.forEach((item) => {
      const rating = parseInt(item.rating);
      if (rating >= 1 && rating <= 5) {
        ratings_count[rating] = parseInt(item.count);
      }
    });

    return {
      member_id: memberId,
      average_rating: average,
      total_reviews: total,
      trust_score,
      distribution: ratings_count,
      ratings_count, // Alias để tương thích với frontend
    };
  }
}
