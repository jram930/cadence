import { Request, Response } from 'express';
import { EntryService } from '../services/EntryService';
import { CreateEntryDto, UpdateEntryDto } from '../types';

// Default user ID for prototype (no auth yet)
const DEFAULT_USER_ID = '00000000-0000-0000-0000-000000000001';

export class EntryController {
  private entryService: EntryService;

  constructor() {
    this.entryService = new EntryService();
  }

  createEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      // TODO: Get userId from authenticated session
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const data: CreateEntryDto = req.body;

      const entry = await this.entryService.createEntry(userId, data);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof Error && error.message === 'Entry already exists for this date') {
        res.status(409).json({ error: error.message });
      } else {
        console.error('Error creating entry:', error);
        res.status(500).json({ error: 'Failed to create entry' });
      }
    }
  };

  updateEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { id } = req.params;
      const data: UpdateEntryDto = req.body;

      const entry = await this.entryService.updateEntry(userId, id, data);
      res.json(entry);
    } catch (error) {
      if (error instanceof Error && error.message === 'Entry not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error updating entry:', error);
        res.status(500).json({ error: 'Failed to update entry' });
      }
    }
  };

  deleteEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { id } = req.params;

      await this.entryService.deleteEntry(userId, id);
      res.status(204).send();
    } catch (error) {
      if (error instanceof Error && error.message === 'Entry not found') {
        res.status(404).json({ error: error.message });
      } else {
        console.error('Error deleting entry:', error);
        res.status(500).json({ error: 'Failed to delete entry' });
      }
    }
  };

  getEntry = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { id } = req.params;

      const entry = await this.entryService.getEntry(userId, id);

      if (!entry) {
        res.status(404).json({ error: 'Entry not found' });
        return;
      }

      res.json(entry);
    } catch (error) {
      console.error('Error fetching entry:', error);
      res.status(500).json({ error: 'Failed to fetch entry' });
    }
  };

  getEntryByDate = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { date } = req.params;

      const entry = await this.entryService.getEntryByDate(userId, new Date(date));

      if (!entry) {
        res.status(404).json({ error: 'Entry not found for this date' });
        return;
      }

      res.json(entry);
    } catch (error) {
      console.error('Error fetching entry by date:', error);
      res.status(500).json({ error: 'Failed to fetch entry' });
    }
  };

  getEntries = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { startDate, endDate } = req.query;

      const entries = await this.entryService.getEntries(
        userId,
        startDate ? new Date(startDate as string) : undefined,
        endDate ? new Date(endDate as string) : undefined
      );

      res.json(entries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      res.status(500).json({ error: 'Failed to fetch entries' });
    }
  };

  getStreakData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;

      const streakData = await this.entryService.getStreakData(userId);
      res.json(streakData);
    } catch (error) {
      console.error('Error fetching streak data:', error);
      res.status(500).json({ error: 'Failed to fetch streak data' });
    }
  };

  getHeatMapData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;
      const { days } = req.query;

      const heatMapData = await this.entryService.getHeatMapData(
        userId,
        days ? parseInt(days as string) : undefined
      );

      res.json(heatMapData);
    } catch (error) {
      console.error('Error fetching heat map data:', error);
      res.status(500).json({ error: 'Failed to fetch heat map data' });
    }
  };

  getAverageMoodData = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string || DEFAULT_USER_ID;

      const averageMoodData = await this.entryService.getAverageMoodData(userId);
      res.json(averageMoodData);
    } catch (error) {
      console.error('Error fetching average mood data:', error);
      res.status(500).json({ error: 'Failed to fetch average mood data' });
    }
  };
}
