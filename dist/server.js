"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./config/app");
const db_1 = require("./config/db");
const seed_1 = require("./config/seed");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const startServer = async () => {
    try {
        // 1. Database Connection
        await (0, db_1.connectDB)();
        // 2. Run Database Seeder
        await (0, seed_1.seedDatabase)();
        // 3. Init Express App & HTTP Server
        const app = (0, app_1.createApp)();
        const server = http_1.default.createServer(app);
        // 4. Listen on PORT with fallback if the preferred port is already in use
        const listenWithFallback = async (port) => {
            return new Promise((resolve, reject) => {
                const onError = (error) => {
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
        const actualPort = await listenWithFallback(env_1.env.PORT);
        logger_1.logger.info(`🚀 Server running in ${env_1.env.NODE_ENV} mode on port ${actualPort}`);
        // ─── Socket.IO Placeholder Hook ───
        // Future Phase integration would initialize Socket.IO server here:
        // const io = new Server(server, { cors: { origin: env.CORS_ORIGINS.split(',') } });
        // Graceful Shutdown
        const shutdown = async (signal) => {
            logger_1.logger.info(`Received ${signal}. Shutting down gracefully...`);
            server.close(() => {
                logger_1.logger.info('HTTP server closed.');
                process.exit(0);
            });
        };
        process.on('SIGTERM', () => shutdown('SIGTERM'));
        process.on('SIGINT', () => shutdown('SIGINT'));
    }
    catch (error) {
        logger_1.logger.error(`❌ Startup Error: ${error.message}`);
        process.exit(1);
    }
};
startServer();
