import express, { Application } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import { env } from './env';
import { requestLogger } from '../middlewares/logging.middleware';
import { globalErrorHandler, notFoundHandler } from '../middlewares/errorHandler.middleware';
import { globalRateLimiter } from '../middlewares/rateLimiter.middleware';
import { mongoSanitizeMiddleware } from '../middlewares/mongoSanitize.middleware';
import { registerRoutes } from '../routes';

export const createApp = (): Application => {
  const app = express();

  // Trust reverse proxy (Render, Cloudflare, Vercel, etc.)
  app.set('trust proxy', 1);

  // Helmet Security Headers
  app.use(helmet());

  // CORS Policy
  app.use(
    cors({
      origin: (origin, callback) => {
        const allowedOrigins = env.CORS_ORIGINS.split(',').map((o) => o.trim());
        if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
        } else {
          callback(new Error(`CORS policy restricts access from origin: ${origin}`));
        }
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Branch-Id', 'X-Company-Id'],
    })
  );

  // Body parser & Cookie parsers
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Prevent MongoDB Operator Injection Attacks
  app.use(mongoSanitizeMiddleware);

  // Rate Limiting
  app.use(globalRateLimiter);

  // Structured Logging
  app.use(requestLogger);

  // Health probe
  app.get('/health', (_req, res) => {
    res.status(200).json({
      success: true,
      message: 'ERP/POS API Server Healthy',
      timestamp: new Date().toISOString(),
    });
  });

  // Load API routing tree
  registerRoutes(app, env.API_PREFIX);

  // Central Error Bounds
  app.use(notFoundHandler);
  app.use(globalErrorHandler);

  return app;
};
