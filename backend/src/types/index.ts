export enum MoodType {
  AMAZING = 'amazing',
  GOOD = 'good',
  OKAY = 'okay',
  BAD = 'bad',
  TERRIBLE = 'terrible',
}

export interface CreateEntryDto {
  content: string;
  mood: MoodType;
  entryDate?: Date;
}

export interface UpdateEntryDto {
  content?: string;
  mood?: MoodType;
}

export interface EntryResponse {
  id: string;
  content: string;
  mood: MoodType;
  entryDate: Date;
  createdAt: Date;
  updatedAt: Date;
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
