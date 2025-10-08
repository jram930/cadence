import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Entry } from '../entities/Entry';
import { AiQueryUsage } from '../entities/AiQueryUsage';
import { MoreThan } from 'typeorm';

export class AdminController {
  async getStats(req: AuthRequest, res: Response): Promise<void> {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const entryRepository = AppDataSource.getRepository(Entry);
      const aiQueryRepository = AppDataSource.getRepository(AiQueryUsage);

      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

      // Total users
      const totalUsers = await userRepository.count();

      // Users signed up in last 24 hours
      const recentUsers = await userRepository.count({
        where: {
          createdAt: MoreThan(twentyFourHoursAgo),
        },
      });

      // Users with at least one entry
      const usersWithEntries = await entryRepository
        .createQueryBuilder('entry')
        .select('COUNT(DISTINCT entry.userId)', 'count')
        .getRawOne();

      // Total entries/notes
      const totalEntries = await entryRepository.count();

      // Top 10 most active users (by entry count)
      const topUsers = await entryRepository
        .createQueryBuilder('entry')
        .select('entry.userId', 'userId')
        .addSelect('user.username', 'username')
        .addSelect('COUNT(entry.id)', 'entryCount')
        .innerJoin('entry.user', 'user')
        .groupBy('entry.userId')
        .addGroupBy('user.username')
        .orderBy('COUNT(entry.id)', 'DESC')
        .limit(10)
        .getRawMany();

      // Total AI queries
      const totalAiQueries = await aiQueryRepository.count();

      // AI queries in last 24 hours
      const recentAiQueries = await aiQueryRepository.count({
        where: {
          queryTime: MoreThan(twentyFourHoursAgo),
        },
      });

      res.json({
        totalUsers,
        recentUsers,
        usersWithEntries: parseInt(usersWithEntries.count) || 0,
        totalEntries,
        topUsers: topUsers.map((u) => ({
          username: u.username,
          entryCount: parseInt(u.entryCount),
        })),
        totalAiQueries,
        recentAiQueries,
        timestamp: now.toISOString(),
      });
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  }
}
