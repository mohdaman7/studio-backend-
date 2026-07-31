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

    // 4. Listen on PORT
    server.listen(env.PORT, () => {
      logger.info(`🚀 Server running in ${env.NODE_ENV} mode on port ${env.PORT}`);
    });

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
