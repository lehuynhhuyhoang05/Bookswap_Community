import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

export interface GoogleBookResult {
  id: string;
  title: string;
  authors?: string[];
  publisher?: string;
  publishedDate?: string;
  description?: string;
  isbn?: string;
  pageCount?: number;
  categories?: string[];
  language?: string;
  imageLinks?: {
    thumbnail?: string;
    smallThumbnail?: string;
  };
}

@Injectable()
export class GoogleBooksService {
  private readonly logger = new Logger(GoogleBooksService.name);
  private readonly apiUrl = 'https://www.googleapis.com/books/v1/volumes';
  private readonly apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.get<string>('GOOGLE_BOOKS_API_KEY') || '';
  }

  async searchBooks(query: string, maxResults: number = 20): Promise<GoogleBookResult[]> {
    try {
      const params: any = {
        q: query,
        maxResults,
      };

      // Only add API key if it exists
      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.apiUrl, { params });

      if (!response.data.items) {
        return [];
      }

      return response.data.items.map(item => this.formatBookData(item));
    } catch (error) {
      this.logger.error(`Google Books API error: ${error.message}`);
      throw error;
    }
  }

  async getBookById(googleBookId: string): Promise<GoogleBookResult> {
    try {
      const params: any = {};
      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(`${this.apiUrl}/${googleBookId}`, { params });
      return this.formatBookData(response.data);
    } catch (error) {
      this.logger.error(`Failed to fetch book ${googleBookId}: ${error.message}`);
      throw new NotFoundException('Book not found in Google Books');
    }
  }

  async searchByISBN(isbn: string): Promise<GoogleBookResult> {
    try {
      const params: any = { q: `isbn:${isbn}` };
      if (this.apiKey) {
        params.key = this.apiKey;
      }

      const response = await axios.get(this.apiUrl, { params });

      if (!response.data.items || response.data.items.length === 0) {
        throw new NotFoundException('Book not found by ISBN');
      }

      return this.formatBookData(response.data.items[0]);
    } catch (error) {
      this.logger.error(`ISBN search error: ${error.message}`);
      throw error;
    }
  }

  private formatBookData(item: any): GoogleBookResult {
    const volumeInfo = item.volumeInfo || {};
    const industryIdentifiers = volumeInfo.industryIdentifiers || [];
    
    const isbn = industryIdentifiers.find(
      (id) => id.type === 'ISBN_13' || id.type === 'ISBN_10'
    )?.identifier;

    return {
      id: item.id,
      title: volumeInfo.title,
      authors: volumeInfo.authors,
      publisher: volumeInfo.publisher,
      publishedDate: volumeInfo.publishedDate,
      description: volumeInfo.description,
      isbn,
      pageCount: volumeInfo.pageCount,
      categories: volumeInfo.categories,
      language: volumeInfo.language,
      imageLinks: volumeInfo.imageLinks,
    };
  }
}