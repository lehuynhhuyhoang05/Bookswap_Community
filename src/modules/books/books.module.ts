import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { Exchange } from '../../infrastructure/database/entities/exchange.entity';
import { ExchangeBook } from '../../infrastructure/database/entities/exchange-book.entity';
import { GoogleBooksModule } from '../../infrastructure/external-services/google-books/google-books.module';
import { BookWanted } from '../../infrastructure/database/entities/book-wanted.entity';
import { ActivityLogService } from '../../common/services/activity-log.service';
import { UserActivityLog } from '../../infrastructure/database/entities/user-activity-log.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Member, BookWanted, Exchange, ExchangeBook, UserActivityLog]),
    GoogleBooksModule,
  ],
  controllers: [BooksController],
  providers: [BooksService, ActivityLogService],
  exports: [BooksService],
})
export class BooksModule {}