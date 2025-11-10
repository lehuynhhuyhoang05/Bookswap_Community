// src/modules/auth/auth.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './controllers/auth.controller';
import { AuthService } from './services/auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

import { User } from '../../infrastructure/database/entities/user.entity';
import { Member } from '../../infrastructure/database/entities/member.entity';
import { PasswordResetToken } from '../../infrastructure/database/entities/password-reset-token.entity';
import { EmailVerificationToken } from '../../infrastructure/database/entities/email-verification-token.entity';
import { EmailService } from '../../infrastructure/external-services/email/email.service';
import { TokenBlacklist } from 'src/infrastructure/database/entities/token-blacklist.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forFeature([User, Member, PasswordResetToken, EmailVerificationToken,TokenBlacklist]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const secret = config.get<string>('JWT_SECRET');
        if (!secret) throw new Error('JWT_SECRET is not defined');

        // Ưu tiên ENV số giây; nếu không có thì mặc định 7 ngày
        // (60 * 60 * 24 * 7 = 604800)
        const expEnv = config.get<string>('JWT_EXPIRES_IN'); // ví dụ: "604800"
        const expiresIn = expEnv ? Number(expEnv) : 60 * 60 * 24 * 7;

        if (Number.isNaN(expiresIn)) {
          throw new Error('JWT_EXPIRES_IN must be a number of seconds');
        }

        return {
          secret,
          signOptions: { expiresIn }, // number OK với type của @nestjs/jwt v10
        };
      },
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, EmailService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
