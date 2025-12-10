import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { NotificationsService } from './services/notifications.service';
import { NotificationsController } from './controllers/notifications.controller';
import { TestNotificationController } from './controllers/test-notification.controller';
import { NotificationsGateway } from './gateways/notifications.gateway';
import { Notification } from '../../infrastructure/database/entities/notification.entity';
import { MessagesModule } from '../messages/messages.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Notification]),
    MessagesModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: '7d' },
      }),
      inject: [ConfigService],
    }),
  ],
  providers: [NotificationsService, NotificationsGateway],
  controllers: [NotificationsController, TestNotificationController],
  exports: [NotificationsService, NotificationsGateway],
})
export class NotificationsModule {}
