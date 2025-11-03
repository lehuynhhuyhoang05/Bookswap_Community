// src/modules/exchanges/interfaces/matching.interface.ts

import { Member } from '../../../infrastructure/database/entities/member.entity';
import { Book } from '../../../infrastructure/database/entities/book.entity';
import { BookWanted } from '../../../infrastructure/database/entities/book-wanted.entity';

export interface MatchScore {
  score: number;
  reasons: string[];
}

export interface MatchFactors {
  bookMatch: number;        // 0-0.5
  trustScore: number;       // 0-0.15
  exchangeHistory: number;  // 0-0.10
  rating: number;           // 0-0.08
  geographic: number;       // 0-0.15
  verification: number;     // 0-0.05
  priority: number;         // 0-0.10
  condition: number;        // 0-0.05
}

export interface ComprehensiveMatchScore {
  score: number;
  breakdown: MatchFactors;
  reasons: string[];
}

export interface PotentialMatch {
  otherMember: Member;
  myBooksTheyWant: Array<{
    myBook: Book;
    theirWant: BookWanted;
    score: ComprehensiveMatchScore;
  }>;
  theirBooksIWant: Array<{
    theirBook: Book;
    myWant: BookWanted;
    score: ComprehensiveMatchScore;
  }>;
  totalScore: number;
  scoreBreakdown: MatchFactors;
}

export interface MatchingConfig {
  minMatchScore: number;
  maxSuggestions: number;
  maxProcessedMembers: number;
  suggestionExpirationDays: number;
  enableGeographicBonus: boolean;
  enableTrustScoreBonus: boolean;
}