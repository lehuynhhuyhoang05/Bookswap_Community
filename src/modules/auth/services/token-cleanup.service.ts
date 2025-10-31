import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { AuthService } from './auth.service';

@Injectable()
export class TokenCleanupService {
  private readonly logger = new Logger(TokenCleanupService.name);

  constructor(private authService: AuthService) {}

  @Cron(CronExpression.EVERY_DAY_AT_3AM)
  async handleCleanup() {
    this.logger.log('Running token blacklist cleanup...');
    
    try {
      await this.authService.cleanupExpiredBlacklistTokens();
      this.logger.log('Token cleanup completed successfully');
    } catch (error) {
      this.logger.error('Token cleanup failed', error);
    }
  }
}