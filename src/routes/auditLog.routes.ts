import { Router } from 'express';
import * as auditLogController from '../controllers/auditLog.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

router.use(authenticate);

router.get('/audit-logs', authorize('audit:read'), auditLogController.getAuditLogs);
router.post('/audit-logs', auditLogController.createAuditLog);

export default router;
