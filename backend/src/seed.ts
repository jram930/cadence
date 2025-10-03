import { AppDataSource } from './config/data-source';
import { Entry } from './entities/Entry';
import { User } from './entities/User';

const moods = ['amazing', 'good', 'okay', 'bad', 'terrible'] as const;

const journalPrompts = [
  "Today was a productive day. Got a lot done at work and felt accomplished.",
  "Spent some quality time with family. These moments are precious.",
  "Feeling a bit overwhelmed with everything on my plate right now.",
  "Had a breakthrough on a project I've been working on. Exciting progress!",
  "Just one of those days where nothing seemed to go right.",
  "Grateful for the little things today. A good cup of coffee and a sunny morning.",
  "Feeling stuck in a rut. Need to shake things up a bit.",
  "Great conversation with a friend reminded me what's important.",
  "Exhausted but satisfied. Put in the work and it shows.",
  "Trying to stay positive despite some challenges.",
  "Beautiful weather today. Went for a walk and cleared my head.",
  "Feeling anxious about upcoming deadlines.",
  "Celebrated a small win today. Progress is progress!",
  "Reflecting on how far I've come this year.",
  "Had a lazy day and that's okay. Rest is important too.",
  "Inspired by something I read today. New perspectives are valuable.",
  "Dealing with some frustrations, but working through them.",
  "Enjoyed a hobby I haven't made time for in a while.",
  "Feeling connected and supported by my community.",
  "Just a regular day, but that's not a bad thing.",
];

async function seed() {
  try {
    // Initialize database connection
    await AppDataSource.initialize();
    console.log('Database connection established');

    // Get or create the default user (matching the frontend user ID)
    const userRepository = AppDataSource.getRepository(User);
    const defaultUserId = '00000000-0000-0000-0000-000000000001';

    let user = await userRepository.findOne({
      where: { id: defaultUserId }
    });

    if (!user) {
      user = userRepository.create({
        id: defaultUserId,
        username: 'demo_user',
        email: 'demo@example.com',
        passwordHash: 'not-a-real-hash', // This is just for demo purposes
      });
      await userRepository.save(user);
      console.log('Created demo user');
    }

    // Generate entries for the past N days
    const daysToGenerate = 180; // ~6 months
    const entryRepository = AppDataSource.getRepository(Entry);

    // Clear existing entries for this user
    await entryRepository.delete({ user: { id: user.id } });
    console.log('Cleared existing entries');

    const entries: Entry[] = [];
    const today = new Date();

    for (let i = 0; i < daysToGenerate; i++) {
      const entryDate = new Date(today);
      entryDate.setDate(today.getDate() - i);

      // Skip some days randomly to create gaps (makes it more realistic)
      if (Math.random() > 0.75) {
        continue; // 25% chance to skip a day
      }

      // Bias towards positive moods but include variety
      const moodWeights = [0.15, 0.35, 0.30, 0.15, 0.05]; // amazing, good, okay, bad, terrible
      const rand = Math.random();
      let mood: typeof moods[number];
      let cumulativeWeight = 0;

      for (let j = 0; j < moods.length; j++) {
        cumulativeWeight += moodWeights[j];
        if (rand <= cumulativeWeight) {
          mood = moods[j];
          break;
        }
      }
      mood = mood!;

      const content = journalPrompts[Math.floor(Math.random() * journalPrompts.length)];

      const entry = entryRepository.create({
        content,
        mood,
        entryDate,
        user,
      });

      entries.push(entry);
    }

    await entryRepository.save(entries);
    console.log(`✅ Successfully created ${entries.length} journal entries over ${daysToGenerate} days`);
    console.log(`📊 Mood distribution:`);

    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    Object.entries(moodCounts).forEach(([mood, count]) => {
      console.log(`   ${mood}: ${count}`);
    });

    await AppDataSource.destroy();
    console.log('\n🎉 Seeding complete!');

  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
}

seed();
