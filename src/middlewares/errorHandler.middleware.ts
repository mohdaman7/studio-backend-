import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { AppError } from './error.middleware';
import { logger } from '../utils/logger';
import { env } from '../config/env';

export const globalErrorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';
  let code = err.code || 'INTERNAL_SERVER_ERROR';
  let errors: any = undefined;

  // Log unhandled non-operational exceptions
  if (!err.isOperational) {
    logger.error('💥 Unhandled Exception:', {
      error: err.message,
      stack: err.stack,
      path: req.originalUrl,
      body: req.body,
    });
  } else {
    logger.warn(`⚠ Application Error: ${message}`, { path: req.originalUrl });
  }

  // Zod Validation Formatting
  if (err instanceof ZodError) {
    statusCode = 400;
    message = 'Validation errors occurred';
    code = 'VALIDATION_ERROR';
    errors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));
  }

  // Mongoose CastError (invalid Object ID)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid value for path: ${err.path}`;
    code = 'CAST_ERROR';
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    statusCode = 409;
    message = 'Duplicate key violation';
    code = 'DUPLICATE_KEY_ERROR';
    errors = err.keyValue;
  }

  res.status(statusCode).json({
    success: false,
    message,
    code,
    ...(errors && { errors }),
    ...(env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

export const notFoundHandler = (req: Request, res: Response, next: NextFunction): void => {
  res.status(404).json({
    success: false,
    message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
    code: 'ROUTE_NOT_FOUND',
  });
};
