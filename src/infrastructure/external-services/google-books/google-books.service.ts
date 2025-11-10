// src/infrastructure/external-services/google-books/google-books.service.ts
import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
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

  constructor(private readonly config: ConfigService) {
    this.apiKey = this.config.get<string>('GOOGLE_BOOKS_API_KEY') || '';

    this.api = axios.create({
      baseURL: 'https://www.googleapis.com/books/v1',
      timeout: 4000,                           // ⬅ timeout cứng 4s
      // paramsSerializer để không sai encode
      paramsSerializer: { indexes: null },
    });

    // Retry nhẹ khi lỗi mạng (2 lần, backoff tuyến tính)
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
    try {
      const params: any = { q: query, maxResults };
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get('/volumes', { params });
      if (!data?.items) return [];
      return data.items.map((item: any) => this.format(item));
    } catch (error: any) {
      this.logger.warn(`Google Books search failed: ${error?.message}`);
      // lỗi mềm: trả mảng rỗng để không chặn luồng
      return [];
    }
  }

  async getBookById(googleBookId: string): Promise<GoogleBookResult> {
    try {
      const params: any = {};
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get(`/volumes/${encodeURIComponent(googleBookId)}`, { params });
      return this.format(data);
    } catch (error: any) {
      this.logger.warn(`Fetch volume ${googleBookId} failed: ${error?.message}`);
      // Bắn NotFound để tầng trên có thể bỏ qua enrich
      throw new NotFoundException('Book not found in Google Books');
    }
  }

  async searchByISBN(isbn: string): Promise<GoogleBookResult> {
    try {
      const params: any = { q: `isbn:${isbn}` };
      if (this.apiKey) params.key = this.apiKey;

      const { data } = await this.api.get('/volumes', { params });
      if (!data?.items?.length) throw new NotFoundException('Book not found by ISBN');
      return this.format(data.items[0]);
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
