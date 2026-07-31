import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/auth.middleware';
import { advancedAuthService } from '../services/advancedAuth.service';
import { ApiResponse } from '../utils/apiResponse';
import { forgotPasswordSchema, resetPasswordSchema, verifyEmailSchema, updateProfileSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';
import { User } from '../models/User.model';

export const registerTenant = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const result = await advancedAuthService.registerTenant(req.body);
  return ApiResponse.created(res, 'Tenant registered successfully. Please verify your email.', result);
});

export const verifyEmail = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token } = verifyEmailSchema.parse(req.query);
  await advancedAuthService.verifyEmail(token);
  return ApiResponse.success(res, 'Email verified successfully.');
});

export const forgotPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { email } = forgotPasswordSchema.parse(req.body);
  await advancedAuthService.forgotPassword(email);
  return ApiResponse.success(res, 'If account exists, reset instructions have been shared.');
});

export const resetPassword = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const { token, password } = resetPasswordSchema.parse(req.body);
  await advancedAuthService.resetPassword(token, password);
  return ApiResponse.success(res, 'Password changed successfully. Please login.');
});

export const updateProfile = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
  const updates = updateProfileSchema.parse(req.body);
  if (!req.user) return ApiResponse.unauthorized(res);

  const updatedUser = await User.findByIdAndUpdate(req.user.userId, updates, { new: true });
  return ApiResponse.success(res, 'Profile updated successfully', updatedUser);
});
