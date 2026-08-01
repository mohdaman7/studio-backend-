import jwt, { SignOptions } from 'jsonwebtoken';
import { env } from '../config/env';

export const generateAccessToken = (payload: { userId: string; email: string; role: string }) => {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, { expiresIn: env.JWT_ACCESS_EXPIRES_IN } as SignOptions);
};

export const generateRefreshToken = (payload: { userId: string }) => {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN } as SignOptions);
};

export const verifyAccessToken = (token: string) => {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
};

export const verifyRefreshToken = (token: string) => {
  return jwt.verify(token, env.JWT_REFRESH_SECRET);
};

export const generateTokenPair = (userId: string, email: string, role: string) => {
  const accessToken = generateAccessToken({ userId, email, role });
  const refreshToken = generateRefreshToken({ userId });
  return { accessToken, refreshToken };
};
