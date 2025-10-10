import { Response } from 'express';
import { AIService } from '../services/AIService';
import { RateLimitService } from '../services/rateLimitService';
import { AuthRequest } from '../middleware/auth';

export class AIController {
  private aiService: AIService;
  private rateLimitService: RateLimitService;

  constructor() {
    this.aiService = new AIService();
    this.rateLimitService = new RateLimitService();
  }

  query = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Check rate limit
      const rateLimitCheck = await this.rateLimitService.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          remaining: rateLimitCheck.remaining,
          resetTime: rateLimitCheck.resetTime,
        });
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

      // Record the query usage
      await this.rateLimitService.recordQuery(userId);

      res.json({
        ...result,
        remaining: rateLimitCheck.remaining - 1,
      });
    } catch (error) {
      console.error('Error in AI query:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  health = async (req: AuthRequest, res: Response): Promise<void> => {
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

  getRateLimit = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;
      const remaining = await this.rateLimitService.getRemainingQueries(userId);

      res.json({
        remaining,
        limit: 5,
      });
    } catch (error) {
      console.error('Error getting rate limit:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };

  enhanceNote = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const userId = req.userId!;

      // Check rate limit
      const rateLimitCheck = await this.rateLimitService.checkRateLimit(userId);
      if (!rateLimitCheck.allowed) {
        res.status(429).json({
          error: 'Rate limit exceeded',
          remaining: rateLimitCheck.remaining,
          resetTime: rateLimitCheck.resetTime,
        });
        return;
      }

      const { content, date } = req.body;

      if (!content || typeof content !== 'string') {
        res.status(400).json({ error: 'Content is required' });
        return;
      }

      if (!date || typeof date !== 'string') {
        res.status(400).json({ error: 'Date is required' });
        return;
      }

      const enhancedContent = await this.aiService.enhanceNote(userId, content, date);

      // Record the query usage
      await this.rateLimitService.recordQuery(userId);

      res.json({
        enhancedContent,
        remaining: rateLimitCheck.remaining - 1,
      });
    } catch (error) {
      console.error('Error enhancing note:', error);
      res.status(500).json({
        error: error instanceof Error ? error.message : 'Internal server error',
      });
    }
  };
}
