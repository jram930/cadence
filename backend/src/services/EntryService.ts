import { Repository, Between, MoreThanOrEqual } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Entry } from '../entities/Entry';
import { CreateEntryDto, UpdateEntryDto, StreakData, HeatMapData, AverageMoodData, MoodType } from '../types';
import { startOfDay, subDays, differenceInDays, format } from 'date-fns';
import { TagService } from './TagService';

export class EntryService {
  private entryRepository: Repository<Entry>;
  private tagService: TagService;

  constructor() {
    this.entryRepository = AppDataSource.getRepository(Entry);
    this.tagService = new TagService();
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

    const savedEntry = await this.entryRepository.save(entry);

    // Extract and save tags
    await this.tagService.updateEntryTags(savedEntry.id, userId, data.content);

    return savedEntry;
  }

  async updateEntry(userId: string, entryId: string, data: UpdateEntryDto): Promise<Entry> {
    const entry = await this.entryRepository.findOne({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Check if entry is from today (compare as date strings to avoid timezone issues)
    const todayStr = format(new Date(), 'yyyy-MM-dd');

    // Format the entry date - handle both Date objects and string representations
    const entryDateStr = format(new Date(entry.entryDate), 'yyyy-MM-dd');

    if (entryDateStr !== todayStr) {
      throw new Error('Cannot edit entries from previous days');
    }

    if (data.content !== undefined) {
      entry.content = data.content;
    }

    if (data.mood !== undefined) {
      entry.mood = data.mood;
    }

    const savedEntry = await this.entryRepository.save(entry);

    // Update tags if content changed
    if (data.content !== undefined) {
      await this.tagService.updateEntryTags(savedEntry.id, userId, savedEntry.content);
    }

    return savedEntry;
  }

  async deleteEntry(userId: string, entryId: string): Promise<void> {
    const entry = await this.entryRepository.findOne({
      where: { id: entryId, userId },
    });

    if (!entry) {
      throw new Error('Entry not found');
    }

    // Check if entry is from today (compare as date strings to avoid timezone issues)
    const todayStr = format(new Date(), 'yyyy-MM-dd');
    const entryDateStr = format(new Date(entry.entryDate), 'yyyy-MM-dd');

    if (entryDateStr !== todayStr) {
      throw new Error('Cannot delete entries from previous days');
    }

    await this.entryRepository.delete({ id: entryId, userId });
  }

  async getEntry(userId: string, entryId: string): Promise<Entry | null> {
    return this.entryRepository.findOne({
      where: { id: entryId, userId },
    });
  }

  async getEntryByDate(userId: string, date: Date): Promise<Entry | null> {
    // Extract just the date part as a string (YYYY-MM-DD)
    const dateStr = typeof date === 'string' ? date : date.toISOString();
    const datePart = dateStr.split('T')[0]; // e.g., "2025-10-09"

    // Query using the date string directly to avoid timezone issues
    return this.entryRepository
      .createQueryBuilder('entry')
      .where('entry.userId = :userId', { userId })
      .andWhere('entry.entryDate = :entryDate', { entryDate: datePart })
      .getOne();
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

  async getAverageMoodData(userId: string): Promise<AverageMoodData> {
    const today = startOfDay(new Date());

    // Mood values for calculation
    const moodValues: Record<string, number> = {
      'terrible': 1,
      'bad': 2,
      'okay': 3,
      'good': 4,
      'amazing': 5,
    };

    // Get entries for last 90 days
    const startDate = subDays(today, 90);
    const entries = await this.entryRepository.find({
      where: {
        userId,
        entryDate: Between(startDate, today),
      },
      order: { entryDate: 'DESC' },
    });

    const calculateAverage = (days: number): number => {
      const cutoffDate = subDays(today, days);
      const filteredEntries = entries.filter(entry =>
        new Date(entry.entryDate) >= cutoffDate
      );

      if (filteredEntries.length === 0) return 0;

      const sum = filteredEntries.reduce((acc, entry) => {
        return acc + moodValues[entry.mood];
      }, 0);

      return sum / filteredEntries.length;
    };

    return {
      last7Days: calculateAverage(7),
      last30Days: calculateAverage(30),
      last90Days: calculateAverage(90),
    };
  }
}
