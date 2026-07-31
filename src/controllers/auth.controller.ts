import { Request, Response } from 'express';
import { authService } from '../services/auth.service';
import { ApiResponse } from '../utils/apiResponse';
import { registerSchema, loginSchema, refreshTokenSchema } from '../validators/auth.validator';
import { asyncHandler } from '../utils/asyncHandler';

export const register = asyncHandler(async (req: Request, res: Response) => {
  const validated = registerSchema.parse(req.body);
  const result = await authService.register(validated);

  // Set refresh token cookie
  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });

  return ApiResponse.created(res, 'User registered successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const login = asyncHandler(async (req: Request, res: Response) => {
  const validated = loginSchema.parse(req.body);
  const result = await authService.login(validated);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, 'Logged in successfully', {
    user: result.user,
    accessToken: result.accessToken,
  });
});

export const refresh = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (!token) return ApiResponse.badRequest(res, 'Refresh token is required');

  const result = await authService.refreshTokens(token);

  res.cookie('refreshToken', result.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });

  return ApiResponse.success(res, 'Token refreshed successfully', {
    accessToken: result.accessToken,
  });
});

export const logout = asyncHandler(async (req: Request, res: Response) => {
  const token = req.body.refreshToken || req.cookies?.refreshToken;
  if (token && req.user) {
    await authService.logout(req.user.userId, token);
  }

  res.clearCookie('refreshToken');
  res.clearCookie('accessToken');

  return ApiResponse.success(res, 'Logged out successfully');
});

export const getMe = asyncHandler(async (req: Request, res: Response) => {
  if (!req.user) return ApiResponse.unauthorized(res);
  const user = await authService.getMe(req.user.userId);
  return ApiResponse.success(res, 'Profile fetched successfully', user);
});
