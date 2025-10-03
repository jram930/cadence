import { Router } from 'express';
import { EntryController } from '../controllers/EntryController';

const router = Router();
const entryController = new EntryController();

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

// Health check
router.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
