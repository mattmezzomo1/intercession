import { Router } from 'express';
import { authenticate } from '../middleware/auth';
import {
  createPrayerReminder,
  getUserPrayerReminders,
  updatePrayerReminder,
  deletePrayerReminder,
} from '../controllers/prayerReminderController';

const router = Router();

// All routes require authentication
router.use(authenticate);

// Create prayer reminder
router.post('/', createPrayerReminder);

// Get user's prayer reminders
router.get('/user', getUserPrayerReminders);

// Update prayer reminder
router.put('/:id', updatePrayerReminder);

// Delete prayer reminder
router.delete('/:id', deletePrayerReminder);

export default router;
