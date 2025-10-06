import { Router } from 'express';
import { EntryController } from '../controllers/EntryController';
import { AIController } from '../controllers/AIController';
import { AuthController } from '../controllers/AuthController';
import { authMiddleware } from '../middleware/auth';

const router = Router();
const entryController = new EntryController();
const aiController = new AIController();
const authController = new AuthController();

// Auth routes (public)
router.post('/auth/signup', authController.signup);
router.post('/auth/login', authController.login);
router.get('/auth/me', authMiddleware, authController.me);

// Entry routes (protected)
router.post('/entries', authMiddleware, entryController.createEntry);
router.get('/entries', authMiddleware, entryController.getEntries);
router.get('/entries/:id', authMiddleware, entryController.getEntry);
router.get('/entries/date/:date', authMiddleware, entryController.getEntryByDate);
router.put('/entries/:id', authMiddleware, entryController.updateEntry);
router.delete('/entries/:id', authMiddleware, entryController.deleteEntry);

// Analytics routes (protected)
router.get('/streak', authMiddleware, entryController.getStreakData);
router.get('/heatmap', authMiddleware, entryController.getHeatMapData);
router.get('/average-mood', authMiddleware, entryController.getAverageMoodData);

// AI routes (protected)
router.post('/ai/query', authMiddleware, aiController.query);
router.get('/ai/health', authMiddleware, aiController.health);

// Health check (public)
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
