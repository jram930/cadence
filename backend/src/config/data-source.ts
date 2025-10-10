import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';
import { User } from '../entities/User';
import { Entry } from '../entities/Entry';
import { AiQueryUsage } from '../entities/AiQueryUsage';
import { Tag } from '../entities/Tag';
import { EntryTag } from '../entities/EntryTag';

dotenv.config();

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'journal_user',
  password: process.env.DB_PASSWORD || 'journal_pass',
  database: process.env.DB_DATABASE || 'micro_journal',
  synchronize: process.env.NODE_ENV === 'development',
  logging: process.env.NODE_ENV === 'development',
  entities: [User, Entry, AiQueryUsage, Tag, EntryTag],
  migrations: ['src/migrations/**/*.ts'],
  subscribers: [],
});
