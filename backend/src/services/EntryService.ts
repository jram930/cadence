import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Entry } from '../entities/Entry';
import { CreateEntryDto, UpdateEntryDto, StreakData, HeatMapData } from '../types';
import { startOfDay, subDays, differenceInDays, format } from 'date-fns';

export class EntryService {
  private entryRepository: Repository<Entry>;

  constructor() {
    this.entryRepository = AppDataSource.getRepository(Entry);
  }

  async createEntry(userId: string, data: CreateEntryDto): Promise<Entry> {
    let entryDate: Date;
    if (data.entryDate) {
      // If entryDate is a string like "2025-10-03", parse it as local date
      const dateStr = typeof data.entryDate === 'string' ? data.entryDate : data.entryDate.toISOString();
      const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
      entryDate = new Date(year, month - 1, day);
    } else {
      entryDate = startOfDay(new Date());
    }

    // Check if entry already exists for this date
    const existing = await this.entryRepository.findOne({
      where: { userId, entryDate },
    });

    if (existing) {
      throw new Error('Entry already exists for this date');
    }

    const entry = this.entryRepository.create({
      userId,
      content: data.content,
      mood: data.mood,
      entryDate,
    });

    return this.entryRepository.save(entry);
  }

  async updateEntry(userId: string, entryId: string, data: UpdateEntryDto): Promise<Entry> {
    const entry = await this.entryRepository.findOne({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    if (data.content !== undefined) {
      entry.content = data.content;
    }

    if (data.mood !== undefined) {
      entry.mood = data.mood;
    }

    return this.entryRepository.save(entry);
  }

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    const result = await this.entryRepository.delete({ id: entryId, userId });

    if (result.affected === 0) {
      throw new Error('Entry not found');
    }
  }

  async getEntry(userId: string, entryId: string): Promise<Entry | null> {
    return this.entryRepository.findOne({
      where: { id: entryId, userId },
    });
  }

  async getEntryByDate(userId: string, date: Date): Promise<Entry | null> {
    let entryDate: Date;
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const [year, month, day] = dateStr.split('T')[0].split('-').map(Number);
    entryDate = new Date(year, month - 1, day);

    return this.entryRepository.findOne({
      where: { userId, entryDate },
    });
  }

  async getEntries(userId: string, startDate?: Date, endDate?: Date): Promise<Entry[]> {
    const query = this.entryRepository.createQueryBuilder('entry').where('entry.userId = :userId', { userId });

    if (startDate && endDate) {
      query.andWhere('entry.entryDate BETWEEN :startDate AND :endDate', {
        startDate: startOfDay(startDate),
        endDate: startOfDay(endDate),
      });
    }

    return query.orderBy('entry.entryDate', 'DESC').getMany();
  }

  async getStreakData(userId: string): Promise<StreakData> {
    const entries = await this.entryRepository.find({
      where: { userId },
      order: { entryDate: 'DESC' },
    });

    if (entries.length === 0) {
      return { currentStreak: 0, longestStreak: 0, totalEntries: 0 };
    }

    const today = startOfDay(new Date());
    const mostRecentEntry = startOfDay(new Date(entries[0].entryDate));

    // Current streak only counts if the most recent entry is today or yesterday
    const daysSinceLastEntry = differenceInDays(today, mostRecentEntry);
    if (daysSinceLastEntry > 1) {
      // Streak is broken, just calculate longest streak from history
      return {
        currentStreak: 0,
        longestStreak: this.calculateLongestStreak(entries),
        totalEntries: entries.length,
      };
    }

    // Calculate current streak (starting from most recent entry)
    let currentStreak = 1;
    let expectedDate = mostRecentEntry;

    for (let i = 1; i < entries.length; i++) {
      const entryDate = startOfDay(new Date(entries[i].entryDate));
      const daysDiff = differenceInDays(expectedDate, entryDate);

      if (daysDiff === 1) {
        // Consecutive day
        currentStreak++;
        expectedDate = entryDate;
      } else {
        // Streak broken, stop counting current streak
        break;
      }
    }

    // Calculate longest streak from all entries
    const longestStreak = Math.max(currentStreak, this.calculateLongestStreak(entries));

    return {
      currentStreak,
      longestStreak,
      totalEntries: entries.length,
    };
  }

  private calculateLongestStreak(entries: Entry[]): number {
    if (entries.length === 0) return 0;

    let longestStreak = 1;
    let currentStreak = 1;

    for (let i = 1; i < entries.length; i++) {
      const prevDate = startOfDay(new Date(entries[i - 1].entryDate));
      const currDate = startOfDay(new Date(entries[i].entryDate));
      const daysDiff = differenceInDays(prevDate, currDate);

      if (daysDiff === 1) {
        currentStreak++;
        longestStreak = Math.max(longestStreak, currentStreak);
      } else {
        currentStreak = 1;
      }
    }

    return longestStreak;
  }

  async getHeatMapData(userId: string, days: number = 365): Promise<HeatMapData[]> {
    const endDate = startOfDay(new Date());
    const startDate = subDays(endDate, days);

    const entries = await this.entryRepository.find({
      where: {
        userId,
        entryDate: Between(startDate, endDate),
      },
      order: { entryDate: 'ASC' },
    });

    const heatMap: HeatMapData[] = [];
    const entryMap = new Map<string, Entry>();

    entries.forEach((entry) => {
      const dateKey = format(new Date(entry.entryDate), 'yyyy-MM-dd');
      entryMap.set(dateKey, entry);
    });

    for (let i = 0; i < days; i++) {
      const date = subDays(endDate, i);
      const dateKey = format(date, 'yyyy-MM-dd');
      const entry = entryMap.get(dateKey);

      heatMap.push({
        date: dateKey,
        count: entry ? 1 : 0,
        mood: entry?.mood,
      });
    }

    return heatMap.reverse();
  }
}
