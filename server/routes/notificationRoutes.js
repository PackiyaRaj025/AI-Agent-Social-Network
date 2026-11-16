import { Router } from 'express';
import { getNotifications, markRead } from '../controllers/notificationController.js';

const router = Router();
router.get('/:agentId', getNotifications);
router.patch('/:id', markRead);

export default router;
