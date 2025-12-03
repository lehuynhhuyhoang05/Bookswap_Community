// src/modules/messages/messages.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MulterModule } from '@nestjs/platform-express';
import { MessagesController } from './controllers/messages.controller';
import { MessagesService } from './services/messages.service';
import { MessagesGateway } from './gateways/messages/messages.gateway';
import { StorageService } from '../../common/services/storage.service';
import { Conversation } from '../../infrastructure/database/entities/conversation.entity';
import { Message } from '../../infrastructure/database/entities/message.entity';
import { MessageReaction } from '../../infrastructure/database/entities/message-reaction.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { ExchangeRequest } from '../../infrastructure/database/entities/exchange-request.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Conversation,
      Message,
      MessageReaction,
      Member,
      ExchangeRequest,
    ]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
    MulterModule.register({
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [MessagesController],
  providers: [MessagesService, MessagesGateway, StorageService],
  exports: [MessagesService, MessagesGateway],
})
export class MessagesModule {}