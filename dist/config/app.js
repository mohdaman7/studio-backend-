"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = void 0;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const env_1 = require("./env");
const logging_middleware_1 = require("../middlewares/logging.middleware");
const errorHandler_middleware_1 = require("../middlewares/errorHandler.middleware");
const rateLimiter_middleware_1 = require("../middlewares/rateLimiter.middleware");
const mongoSanitize_middleware_1 = require("../middlewares/mongoSanitize.middleware");
const routes_1 = require("../routes");
const createApp = () => {
    const app = (0, express_1.default)();
    // Helmet Security Headers
    app.use((0, helmet_1.default)());
    // CORS Policy
    app.use((0, cors_1.default)({
        origin: (origin, callback) => {
            const allowedOrigins = env_1.env.CORS_ORIGINS.split(',').map((o) => o.trim());
            if (!origin || allowedOrigins.includes(origin)) {
                callback(null, true);
            }
            else {
                callback(new Error(`CORS policy restricts access from origin: ${origin}`));
            }
        },
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization', 'X-Branch-Id', 'X-Company-Id'],
    }));
    // Body parser & Cookie parsers
    app.use(express_1.default.json({ limit: '10mb' }));
    app.use(express_1.default.urlencoded({ extended: true, limit: '10mb' }));
    app.use((0, cookie_parser_1.default)());
    // Prevent MongoDB Operator Injection Attacks
    app.use(mongoSanitize_middleware_1.mongoSanitizeMiddleware);
    // Rate Limiting
    app.use(rateLimiter_middleware_1.globalRateLimiter);
    // Structured Logging
    app.use(logging_middleware_1.requestLogger);
    // Health probe
    app.get('/health', (_req, res) => {
        res.status(200).json({
            success: true,
            message: 'ERP/POS API Server Healthy',
            timestamp: new Date().toISOString(),
        });
    });
    // Load API routing tree
    (0, routes_1.registerRoutes)(app, env_1.env.API_PREFIX);
    // Central Error Bounds
    app.use(errorHandler_middleware_1.notFoundHandler);
    app.use(errorHandler_middleware_1.globalErrorHandler);
    return app;
};
exports.createApp = createApp;
