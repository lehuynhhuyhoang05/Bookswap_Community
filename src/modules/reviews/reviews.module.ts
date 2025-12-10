import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Review } from '../../infrastructure/database/entities/review.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { ReviewsService } from './services/reviews.service';
import { ReviewsController } from './controllers/reviews.controller';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { UserActivityLog } from '../../infrastructure/database/entities/user-activity-log.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Review, Exchange, Member, UserActivityLog])],
  providers: [ReviewsService, ActivityLogService],
  controllers: [ReviewsController],
  exports: [ReviewsService],
})
export class ReviewsModule {}
