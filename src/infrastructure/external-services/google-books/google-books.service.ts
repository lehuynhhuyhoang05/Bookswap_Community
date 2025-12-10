// src/infrastructure/external-services/google-books/google-books.service.ts
import { Injectable, Logger, NotFoundException, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import type { Cache } from 'cache-manager';
import axios, { AxiosInstance } from 'axios';

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
  imageLinks?: { thumbnail?: string; smallThumbnail?: string };
}

@Injectable()
export class GoogleBooksService {
  private readonly logger = new Logger(GoogleBooksService.name);
  private readonly api: AxiosInstance;
  private readonly apiKey: string;

  constructor(
    private readonly config: ConfigService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {
    this.apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY') || '';

    this.api = axios.create({
      baseURL: 'https://www.googleapis.com/books/v1',
      timeout: 4000,
      paramsSerializer: { indexes: null },
    });

    // Retry on network errors
    this.api.interceptors.response.use(
      (r) => r,
      async (err) => {
        const cfg = err.config as any;
        cfg.__retryCount = cfg.__retryCount ?? 0;
        if (cfg.__retryCount < 2 && (err.code === 'ECONNABORTED' || !err.response)) {
          cfg.__retryCount++;
          await new Promise((r) => setTimeout(r, 300 * cfg.__retryCount));
          return this.api.request(cfg);
        }
        return Promise.reject(err);
      },
    );
  }

  async searchBooks(query: string, maxResults = 20): Promise<GoogleBookResult[]> {
    const cacheKey = `gbooks:search:${query}:${maxResults}`;
    
    // Check cache first
    const cached = await this.cacheManager.get<GoogleBookResult[]>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for search: ${query}`);
      return cached;
    }

    try {
      const params: any = { q: query, maxResults };
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get('/volumes', { params });
      if (!data?.items) return [];
      
      const results = data.items.map((item: any) => this.format(item));
      
      // Cache for 24 hours
      await this.cacheManager.set(cacheKey, results, 86400);
      this.logger.debug(`Cached search results: ${query} (${results.length} books)`);
      
      return results;
    } catch (error: any) {
      this.logger.warn(`Google Books search failed: ${error?.message}`);
      return [];
    }
  }

  async getBookById(googleBookId: string): Promise<GoogleBookResult> {
    const cacheKey = `gbooks:id:${googleBookId}`;
    
    // Check cache first
    const cached = await this.cacheManager.get<GoogleBookResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for book ID: ${googleBookId}`);
      return cached;
    }

    try {
      const params: any = {};
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get(`/volumes/${encodeURIComponent(googleBookId)}`, { params });
      const result = this.format(data);
      
      // Cache for 24 hours
      await this.cacheManager.set(cacheKey, result, 86400);
      this.logger.debug(`Cached book by ID: ${googleBookId}`);
      
      return result;
    } catch (error: any) {
      this.logger.warn(`Fetch volume ${googleBookId} failed: ${error?.message}`);
      throw new NotFoundException('Book not found in Google Books');
    }
  }

  async searchByISBN(isbn: string): Promise<GoogleBookResult> {
    const cacheKey = `gbooks:isbn:${isbn}`;
    
    // Check cache first
    const cached = await this.cacheManager.get<GoogleBookResult>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for ISBN: ${isbn}`);
      return cached;
    }

    try {
      const params: any = { q: `isbn:${isbn}` };
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get('/volumes', { params });
      if (!data?.items?.length) throw new NotFoundException('Book not found by ISBN');
      
      const result = this.format(data.items[0]);
      
      // Cache for 24 hours
      await this.cacheManager.set(cacheKey, result, 86400);
      this.logger.debug(`Cached book by ISBN: ${isbn}`);
      
      return result;
    } catch (error: any) {
      this.logger.warn(`ISBN search failed: ${error?.message}`);
      throw error;
    }
  }

  private format(item: any): GoogleBookResult {
    const v = item?.volumeInfo ?? {};
    const ids = v.industryIdentifiers ?? [];
    const isbn = ids.find((x: any) => x?.type === 'ISBN_13')?.identifier
              ?? ids.find((x: any) => x?.type === 'ISBN_10')?.identifier;

    return {
      id: item?.id,
      title: v.title,
      authors: v.authors,
      publisher: v.publisher,
      publishedDate: v.publishedDate,
      description: v.description,
      isbn,
      pageCount: v.pageCount,
      categories: v.categories,
      language: v.language,
      imageLinks: v.imageLinks,
    };
  }
}
