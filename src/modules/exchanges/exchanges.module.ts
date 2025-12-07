// src/modules/exchanges/exchanges.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { BookWanted } from '../../infrastructure/database/entities/book-wanted.entity';
import { ExchangeRequest } from '../../infrastructure/database/entities/exchange-request.entity';
import { ExchangeRequestBook } from '../../infrastructure/database/entities/exchange-request-book.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../infrastructure/database/entities/exchange-book.entity';
import { ExchangeSuggestion } from '../../infrastructure/database/entities/exchange-suggestion.entity';
import { BookMatchPair } from '../../infrastructure/database/entities/book-match-pair.entity';
import { ExchangesController } from './controllers/exchanges.controller';
import { ExchangesService } from './services/exchanges.service';
import { MatchingService } from './services/matching.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { UserActivityLog } from '../../infrastructure/database/entities/user-activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Book,
      BookWanted, // ← THIS WAS MISSING!
      ExchangeRequest,
      ExchangeRequestBook,
      Exchange,
      ExchangeBook,
      ExchangeSuggestion,
      BookMatchPair,
      UserActivityLog,
    ]),
    NotificationsModule, // Import NotificationsModule
  ],
  controllers: [ExchangesController],
  providers: [ExchangesService, MatchingService, ActivityLogService],
  exports: [ExchangesService, MatchingService],
})
export class ExchangesModule {}