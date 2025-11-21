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
    ]),
  ],
  controllers: [ExchangesController],
  providers: [ExchangesService, MatchingService],
  exports: [ExchangesService, MatchingService],
})
export class ExchangesModule {}