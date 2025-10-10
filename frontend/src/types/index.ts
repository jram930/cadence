export enum MoodType {
  AMAZING = 'amazing',
  GOOD = 'good',
  OKAY = 'okay',
  BAD = 'bad',
  TERRIBLE = 'terrible',
}

export interface Entry {
  id: string;
  content: string;
  mood: MoodType;
  entryDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateEntryDto {
  content: string;
  mood: MoodType;
  entryDate?: string;
}

export interface UpdateEntryDto {
  content?: string;
  mood?: MoodType;
}

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  totalEntries: number;
}

export interface HeatMapData {
  date: string;
  count: number;
  mood?: MoodType;
}

export interface AverageMoodData {
  last7Days: number;
  last30Days: number;
  last90Days: number;
}

export interface Tag {
  id: string;
  userId: string;
  name: string;
  usageCount: number;
  createdAt: string;
}
