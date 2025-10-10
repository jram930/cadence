import { Response } from 'express';
import { TagService } from '../services/TagService';
import { AuthRequest } from '../middleware/auth';

export class TagController {
  private tagService: TagService;

  constructor() {
    this.tagService = new TagService();
  }

  getTags = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const tags = await this.tagService.getUserTags(userId);
      res.json(tags);
    } catch (error) {
      console.error('Error fetching tags:', error);
      res.status(500).json({ error: 'Failed to fetch tags' });
    }
  };

  getEntriesByTag = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const { tagName } = req.params;

      const entries = await this.tagService.getEntriesByTag(userId, tagName);
      res.json(entries);
    } catch (error) {
      console.error('Error fetching entries by tag:', error);
      res.status(500).json({ error: 'Failed to fetch entries by tag' });
    }
  };
}
