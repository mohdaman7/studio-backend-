import { Router } from 'express';
import * as authController from '../controllers/auth.controller';
import * as advAuthController from '../controllers/advancedAuth.controller';
import { authenticate } from '../middlewares/auth.middleware';
import { authRateLimiter } from '../middlewares/rateLimiter.middleware';

const router = Router();

// Standard auth routes
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh', authController.refresh);
router.post('/logout', authenticate, authController.logout);
router.get('/me', authenticate, authController.getMe);

// Advanced SaaS Tenant & Verification routes
router.post('/tenant/register', authRateLimiter, advAuthController.registerTenant);
router.get('/verify-email', advAuthController.verifyEmail);
router.post('/forgot-password', authRateLimiter, advAuthController.forgotPassword);
router.post('/reset-password', advAuthController.resetPassword);
router.patch('/profile', authenticate, advAuthController.updateProfile);

export default router;
