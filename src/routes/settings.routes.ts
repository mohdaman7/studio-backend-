import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/settings', settingsController.getSettings);
router.put('/settings', authorize('settings:write'), settingsController.updateSettings);
router.get('/company/profile', settingsController.getCompanyProfile);
router.put('/company/profile', authorize('settings:write'), settingsController.updateCompanyProfile);

export default router;
