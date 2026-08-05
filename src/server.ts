import http from 'http';
import { createApp } from './config/app';
import { connectDB } from './config/db';
import { seedDatabase } from './config/seed';
import { env } from './config/env';
import { logger } from './utils/logger';

const startServer = async () => {
  try {
    // 1. Database Connection
    await connectDB();

    // 2. Run Database Seeder
    await seedDatabase();

    // 3. Init Express App & HTTP Server
    const app = createApp();
    const server = http.createServer(app);

    // 4. Listen on PORT with fallback if the preferred port is already in use
    const listenWithFallback = async (port: number): Promise<number> => {
      return new Promise((resolve, reject) => {
        const onError = (error: NodeJS.ErrnoException) => {
          if (error.code === 'EADDRINUSE' && port < 6000) {
            server.removeListener('error', onError);
            resolve(listenWithFallback(port + 1));
            return;
          }

          server.removeListener('error', onError);
          reject(error);
        };

        server.once('error', onError);
        server.listen(port, () => {
          server.removeListener('error', onError);
          resolve(port);
        });
      });
    };

    const actualPort = await listenWithFallback(env.PORT);
    logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${actualPort}`);

    // ─── Socket.IO Placeholder Hook ───
    // Future Phase integration would initialize Socket.IO server here:
    // const io = new Server(server, { cors: { origin: env.CORS_ORIGINS.split(',') } });

    // Graceful Shutdown
    const shutdown = async (signal: string) => {
      logger.info(`Received ${signal}. Shutting down gracefully...`);
      server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));

  } catch (error: any) {
    logger.error(`❌ Startup Error: ${error.message}`);
    process.exit(1);
  }
};

startServer();
