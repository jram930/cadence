import { Request, Response } from 'express';
import { AIService } from '../services/AIService';

export class AIController {
  private aiService: AIService;

  constructor() {
    this.aiService = new AIService();
  }

  query = async (req: Request, res: Response): Promise<void> => {
    try {
      const userId = req.headers['x-user-id'] as string;

      if (!userId) {
        res.status(401).json({ error: 'User ID required' });
        return;
      }

      const { question, startDate, endDate } = req.body;

      if (!question || typeof question !== 'string') {
        res.status(400).json({ error: 'Question is required' });
        return;
      }

      const result = await this.aiService.queryEntries(userId, {
        question,
        startDate,
        endDate,
      });

      res.json(result);
    } catch (error) {
      console.error('Error in AI query:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  health = async (req: Request, res: Response): Promise<void> => {
    try {
      const isConnected = await this.aiService.testConnection();
      res.json({
        status: isConnected ? 'healthy' : 'unhealthy',
        message: isConnected
          ? 'Ollama connection successful'
          : 'Ollama connection failed. Make sure Ollama is running.',
      });
    } catch (error) {
      res.status(500).json({
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
      });
    }
  };
}
