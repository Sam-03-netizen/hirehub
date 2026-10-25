import { Router } from 'express';
import { getNotifications, markRead, markAllRead } from '../controllers/notificationController.js';
import { protect } from '../middlewares/auth.js';

const router = Router();
router.use(protect);
router.get('/', getNotifications);
router.patch('/read-all', markAllRead); // must be above '/:id/read'
router.patch('/:id/read', markRead);
export default router;
