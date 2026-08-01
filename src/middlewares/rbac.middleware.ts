import { Request, Response, NextFunction } from 'express';
import { authorizePermission } from './auth.middleware';

export const authorize = (permission: string) => {
  return authorizePermission(permission);
};
