import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { ExchangeRequest } from '../../infrastructure/database/entities/exchange-request.entity';
import { ExchangeRequestBook } from '../../infrastructure/database/entities/exchange-request-book.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../infrastructure/database/entities/exchange-book.entity';
import { ExchangesController } from './controllers/exchanges.controller';
import { ExchangesService } from './services/exchanges.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Member,
      Book,
      ExchangeRequest,
      ExchangeRequestBook,
      Exchange,
      ExchangeBook,
    ]),
  ],
  controllers: [ExchangesController],
  providers: [ExchangesService],
  exports: [ExchangesService],
})
export class ExchangesModule {}
