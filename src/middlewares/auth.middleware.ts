import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/tokens';
import { AuthenticationError, AuthorizationError } from './error.middleware';
import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { asyncHandler } from '../utils/asyncHandler';

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
    role: string;
    companyId: string;
    branchId?: string;
  };
}

export const authenticate = asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.cookies?.accessToken) {
    token = req.cookies.accessToken;
  } else if (typeof req.query?.token === 'string') {
    token = req.query.token;
  }

  if (!token) {
    throw new AuthenticationError('Session expired or access token missing');
  }

  try {
    const decoded = verifyAccessToken(token) as any;
    
    // Check database to ensure user is active and get populated role
    const user = await User.findById(decoded.userId).select('isActive companyId branchId role').populate('role').lean();
    if (!user || !user.isActive) {
      throw new AuthenticationError('User profile deactivated or deleted');
    }

    const currentRoleSlug = (user.role as any)?.slug || decoded.role || 'super-admin';

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      role: currentRoleSlug,
      companyId: user.companyId.toString(),
      branchId: user.branchId?.toString(),
    };

    next();
  } catch (error) {
    throw new AuthenticationError('Invalid signature or expired session token');
  }
});

/**
 * Authorize using system permission codes.
 * Bypasses checks for Super Admin and Admin role slugs automatically.
 */
export const authorizePermission = (permission: string) => {
  return asyncHandler(async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AuthenticationError();
    }

    if (req.user.role === 'super-admin' || req.user.role === 'admin' || req.user.role === 'Super Admin' || req.user.role === 'Admin') {
      return next();
    }

    const role = await Role.findOne({ slug: req.user.role, isActive: true }).lean();
    if (!role || !role.permissions.includes(permission)) {
      throw new AuthorizationError(`Access denied. Missing permission: ${permission}`);
    }

    next();
  });
};
