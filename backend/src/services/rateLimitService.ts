import { AppDataSource } from '../config/data-source';
import { AiQueryUsage } from '../entities/AiQueryUsage';
import { MoreThan } from 'typeorm';

const HOURLY_LIMIT = 5;

export class RateLimitService {
  private aiQueryUsageRepository = AppDataSource.getRepository(AiQueryUsage);

  async checkRateLimit(userId: string, queryType: string = 'insights'): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
  }> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    // Count queries in the last hour
    const recentQueries = await this.aiQueryUsageRepository.count({
      where: {
        userId,
        queryType,
        queryTime: MoreThan(oneHourAgo),
      },
    });

    const remaining = Math.max(0, HOURLY_LIMIT - recentQueries);
    const allowed = recentQueries < HOURLY_LIMIT;

    // Calculate reset time (start of next hour)
    const now = new Date();
    const resetTime = new Date(now);
    resetTime.setHours(now.getHours() + 1, 0, 0, 0);

    return {
      allowed,
      remaining,
      resetTime,
    };
  }

  async recordQuery(userId: string, queryType: string = 'insights'): Promise<void> {
    const usage = this.aiQueryUsageRepository.create({
      userId,
      queryType,
    });

    await this.aiQueryUsageRepository.save(usage);
  }

  async getRemainingQueries(userId: string, queryType: string = 'insights'): Promise<number> {
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

    const recentQueries = await this.aiQueryUsageRepository.count({
      where: {
        userId,
        queryType,
        queryTime: MoreThan(oneHourAgo),
      },
    });

    return Math.max(0, HOURLY_LIMIT - recentQueries);
  }
}
