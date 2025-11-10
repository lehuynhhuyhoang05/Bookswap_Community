import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { GoogleBooksModule } from '../../infrastructure/external-services/google-books/google-books.module';
import { BookWanted } from '../../infrastructure/database/entities/book-wanted.entity'
@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Member, BookWanted]),
    GoogleBooksModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}