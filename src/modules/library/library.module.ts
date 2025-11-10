// src/modules/library/library.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LibraryController } from './controllers/library.controller';
import { LibraryService } from './services/library.service';
import { PersonalLibrary } from '../../infrastructure/database/entities/personal-library.entity';
import { BookWanted } from '../../infrastructure/database/entities/book-wanted.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      PersonalLibrary,
      BookWanted,
      Member,
    ]),
  ],
  controllers: [LibraryController],
  providers: [LibraryService],
  exports: [LibraryService],
})
export class LibraryModule {}