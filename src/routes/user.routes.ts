import { Router } from 'express';
import * as userController from '../controllers/user.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authorize } from '../middlewares/rbac.middleware';

const router = Router();

// Apply authentication to all user/role routes
router.use(authenticate);

// Users CRUD
router.get('/users', authorize('user:read'), userController.getUsers);
router.get('/users/:id', authorize('user:read'), userController.getUserById);
router.post('/users', authorize('user:create'), userController.createUser);
router.put('/users/:id', authorize('user:update'), userController.updateUser);
router.delete('/users/:id', authorize('user:delete'), userController.deleteUser);
router.patch('/users/:id/toggle-status', authorize('user:update'), userController.toggleUserActive);

// Roles CRUD
router.get('/roles', authorize('role:read'), userController.getRoles);
router.get('/roles/:id', authorize('role:read'), userController.getRoleById);
router.post('/roles', authorize('role:create'), userController.createRole);
router.put('/roles/:id', authorize('role:update'), userController.updateRole);
router.delete('/roles/:id', authorize('role:delete'), userController.deleteRole);

export default router;
