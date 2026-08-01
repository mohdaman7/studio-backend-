import { Router } from 'express';
import * as notificationController from '../controllers/notification.controller';
import { authenticate } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

router.get('/notifications', notificationController.getNotifications);
router.patch('/notifications/:id/read', notificationController.markAsRead);
router.patch('/notifications/read-all', notificationController.markAllAsRead);
router.delete('/notifications/:id', notificationController.deleteNotification);

export default router;
