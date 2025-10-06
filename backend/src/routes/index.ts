import { Router } from 'express';
import { EntryController } from '../controllers/EntryController';
import { AIController } from '../controllers/AIController';

const router = Router();
const entryController = new EntryController();
const aiController = new AIController();

// Entry routes
router.post('/entries', entryController.createEntry);
router.get('/entries', entryController.getEntries);
router.get('/entries/:id', entryController.getEntry);
router.get('/entries/date/:date', entryController.getEntryByDate);
router.put('/entries/:id', entryController.updateEntry);
router.delete('/entries/:id', entryController.deleteEntry);

// Analytics routes
router.get('/streak', entryController.getStreakData);
router.get('/heatmap', entryController.getHeatMapData);
router.get('/average-mood', entryController.getAverageMoodData);

// AI routes
router.post('/ai/query', aiController.query);
router.get('/ai/health', aiController.health);

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
