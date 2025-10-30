// src/infrastructure/external-services/google-books/google-books.types.ts
export interface GoogleBookResult {
  id: string;
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  language?: string;
  categories?: string[];
  isbn?: string;
  pageCount?: number;
}
