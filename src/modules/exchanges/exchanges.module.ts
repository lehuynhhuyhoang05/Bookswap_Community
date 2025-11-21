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
import { TrustScoreService } from '../../common/services/trust-score.service';
import { Review } from '../../infrastructure/database/entities/review.entity';
import { User } from '../../infrastructure/database/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Book,
      BookWanted,
      ExchangeRequest,
      ExchangeRequestBook,
      Exchange,
      ExchangeBook,
      ExchangeSuggestion,
      BookMatchPair,
      Review, // For TrustScoreService
      User, // For TrustScoreService
    ]),
  ],
  controllers: [ExchangesController],
  providers: [ExchangesService, MatchingService, TrustScoreService],
  exports: [ExchangesService, MatchingService, TrustScoreService],
})
export class ExchangesModule {}