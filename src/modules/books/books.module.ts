import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BooksService } from './services/books.service';
import { BooksController } from './controllers/books.controller';
import { Book } from '../../infrastructure/database/entities/book.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { GoogleBooksModule } from '../../infrastructure/external-services/google-books/google-books.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Book, Member]),
    GoogleBooksModule,
  ],
  controllers: [BooksController],
  providers: [BooksService],
  exports: [BooksService],
})
export class BooksModule {}