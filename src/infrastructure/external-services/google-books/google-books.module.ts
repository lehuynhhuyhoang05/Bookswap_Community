import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { GoogleBooksService } from './google-books.service';
import * as redisStore from 'cache-manager-redis-store';

@Module({
  imports: [
    CacheModule.register({
      store: redisStore,
      host: process.env.REDIS_HOST || 'localhost',
      port: parseInt(process.env.REDIS_PORT || '6379'),
      ttl: 86400, // 24 hours cache for Google Books data
      max: 1000, // Max 1000 cached queries
    }),
  ],
  providers: [GoogleBooksService],
  exports: [GoogleBooksService],
})
export class GoogleBooksModule {}