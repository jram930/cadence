import { Repository } from 'typeorm';
import { AppDataSource } from '../config/data-source';
import { Tag } from '../entities/Tag';
import { EntryTag } from '../entities/EntryTag';
import { Entry } from '../entities/Entry';

export class TagService {
  private tagRepository: Repository<Tag>;
  private entryTagRepository: Repository<EntryTag>;
  private entryRepository: Repository<Entry>;

  constructor() {
    this.tagRepository = AppDataSource.getRepository(Tag);
    this.entryTagRepository = AppDataSource.getRepository(EntryTag);
    this.entryRepository = AppDataSource.getRepository(Entry);
  }

  /**
   * Extract hashtags from content
   * Matches #word but not ##word (markdown heading)
   */
  extractHashtags(content: string): string[] {
    const hashtagRegex = /(?:^|[^#\w])#([\w]+)/g;
    const tags = new Set<string>();
    let match;

    while ((match = hashtagRegex.exec(content)) !== null) {
      tags.add(match[1].toLowerCase());
    }

    return Array.from(tags);
  }

  /**
   * Update tags for an entry
   * Removes old tags and creates new ones based on content
   */
  async updateEntryTags(entryId: string, userId: string, content: string): Promise<void> {
    // Extract hashtags from content
    const tagNames = this.extractHashtags(content);

    // Remove all existing entry tags
    await this.entryTagRepository.delete({ entryId });

    if (tagNames.length === 0) {
      return;
    }

    // Create or get tags
    const tags: Tag[] = [];
    for (const tagName of tagNames) {
      let tag = await this.tagRepository.findOne({
        where: { userId, name: tagName },
      });

      if (!tag) {
        tag = this.tagRepository.create({
          userId,
          name: tagName,
          usageCount: 0,
        });
        await this.tagRepository.save(tag);
      }

      tags.push(tag);
    }

    // Create entry tags
    const entryTags = tags.map((tag) =>
      this.entryTagRepository.create({
        entryId,
        tagId: tag.id,
      })
    );

    await this.entryTagRepository.save(entryTags);

    // Update usage counts
    await this.updateTagUsageCounts(userId);
  }

  /**
   * Recalculate usage counts for all user's tags
   */
  private async updateTagUsageCounts(userId: string): Promise<void> {
    const tags = await this.tagRepository.find({ where: { userId } });

    for (const tag of tags) {
      const count = await this.entryTagRepository
        .createQueryBuilder('et')
        .innerJoin('et.entry', 'entry')
        .where('et.tagId = :tagId', { tagId: tag.id })
        .andWhere('entry.userId = :userId', { userId })
        .getCount();

      tag.usageCount = count;
      await this.tagRepository.save(tag);
    }
  }

  /**
   * Get all tags for a user
   */
  async getUserTags(userId: string): Promise<Tag[]> {
    return this.tagRepository.find({
      where: { userId },
      order: { usageCount: 'DESC', name: 'ASC' },
    });
  }

  /**
   * Get entries for a specific tag
   */
  async getEntriesByTag(userId: string, tagName: string): Promise<Entry[]> {
    const tag = await this.tagRepository.findOne({
      where: { userId, name: tagName.toLowerCase() },
    });

    if (!tag) {
      return [];
    }

    const entryTags = await this.entryTagRepository.find({
      where: { tagId: tag.id },
      relations: ['entry'],
    });

    const entries = entryTags
      .map((et) => et.entry)
      .filter((entry) => entry.userId === userId)
      .sort((a, b) => new Date(b.entryDate).getTime() - new Date(a.entryDate).getTime());

    return entries;
  }
}
