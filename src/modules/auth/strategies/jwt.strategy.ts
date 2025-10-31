// src/modules/auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy, StrategyOptions } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Request } from 'express';
import { AuthService } from '../services/auth.service';
import { AccountStatus } from '../../../infrastructure/database/entities/user.entity';
import { UserRole } from '../types/auth-user.type';

export interface JwtPayload {
  sub: string;      // user id
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly config: ConfigService,
    private readonly authService: AuthService,
  ) {
    const secret = config.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET is not defined');

    const options: StrategyOptions = {
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
      passReqToCallback: true,
      algorithms: ['HS256'],
    };

    const issuer = config.get<string>('JWT_ISSUER');
    const audience = config.get<string>('JWT_AUDIENCE');
    if (issuer) (options as any).issuer = issuer;
    if (audience) (options as any).audience = audience;
    (options as any).jsonWebTokenOptions = { clockTolerance: 5 };

    super(options);
  }

  async validate(req: Request, payload: JwtPayload) {
    // Lấy raw token
    const token = ExtractJwt.fromAuthHeaderAsBearerToken()(req);
    if (!token) throw new UnauthorizedException('No token provided');

    // Check blacklist
    const isBlacklisted = await this.authService.isTokenBlacklisted(token);
    if (isBlacklisted) throw new UnauthorizedException('Token has been revoked');

    // Lấy user & check status
    const user = await this.authService.validateUser(payload.sub);
    if (!user) throw new UnauthorizedException('User not found');

    const status: AccountStatus = (user.account_status ?? user.status ?? 'ACTIVE') as AccountStatus;
    if (status !== 'ACTIVE') throw new UnauthorizedException('Account is not active');

    // Lấy memberId (nếu có)
    let memberId: string | undefined = undefined;
    if (typeof this.authService.findMemberIdByUserId === 'function') {
      try {
        memberId = await this.authService.findMemberIdByUserId(payload.sub);
      } catch {
        // an toàn: không làm hỏng auth nếu member không tìm được
        memberId = undefined;
      }
    } else if (user.member?.member_id) {
      memberId = user.member.member_id;
    }

    // Trả về object thống nhất cho request.user
    return {
      sub: payload.sub,          // để guard/decorator cũ dùng được
      userId: payload.sub,       // để code mới đọc nhanh
      email: payload.email,
      role: payload.role,
      memberId,
    };
  }
}
