import 'reflect-metadata';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

async function initDatabase() {
  try {
    console.log('Initializing database connection...');
    await AppDataSource.initialize();
    console.log('Database connection established');

    console.log('Synchronizing database schema...');
    await AppDataSource.synchronize();
    console.log('Database schema synchronized successfully');

    // Create default user for prototype
    const userRepository = AppDataSource.getRepository(User);
    const existingUser = await userRepository.findOne({ where: { id: DEFAULT_USER_ID } });

    if (!existingUser) {
      console.log('Creating default user...');
      const defaultUser = userRepository.create({
        id: DEFAULT_USER_ID,
        username: 'default',
        email: 'default@example.com',
        passwordHash: 'not-used-yet',
      });
      await userRepository.save(defaultUser);
      console.log('Default user created');
    } else {
      console.log('Default user already exists');
    }

    console.log('Closing connection...');
    await AppDataSource.destroy();
    console.log('Done!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
}

initDatabase();
