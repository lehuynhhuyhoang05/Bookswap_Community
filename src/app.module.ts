// src/app.module.ts
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ScheduleModule } from '@nestjs/schedule';
import { APP_GUARD } from '@nestjs/core';
import { AuthModule } from './modules/auth/auth.module';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { BooksModule } from './modules/books/books.module';
import { MiddlewareConsumer, NestModule } from '@nestjs/common';
import { RequestAuthLogMiddleware } from './common/middlewares/request-auth-log.middleware';
import { LibraryModule } from './modules/library/library.module';
import { ExchangesModule } from './modules/exchanges/exchanges.module';
import { MessagesModule } from './modules/messages/messages.module';
import { ReviewsModule } from './modules/reviews/reviews.module';
import { AdminModule } from './modules/admin/admin.module';
import { ReportsModule } from './modules/reports/reports.module';
@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ScheduleModule.forRoot(),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'mysql' as const,
        host: config.get<string>('DB_HOST', 'localhost'),
        port: parseInt(config.get<string>('DB_PORT', '3306'), 10),
        username: config.get<string>('DB_USERNAME', 'root'),
        password: config.get<string>('DB_PASSWORD', ''),
        database: config.get<string>('DB_DATABASE', 'bookswap_db'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: false,
        charset: 'utf8mb4',
      }),
    }),

    AuthModule,
    BooksModule,
    LibraryModule,
    ExchangesModule,
    MessagesModule,
    ReviewsModule,
    AdminModule,
    ReportsModule,
    // Notifications module provides in-app notifications and real-time emits
    require('./modules/notifications/notifications.module').NotificationsModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(RequestAuthLogMiddleware).forRoutes('*');
  }
}
