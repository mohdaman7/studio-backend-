"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.env = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
exports.env = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: parseInt(process.env.PORT || '5000', 10),
    API_PREFIX: process.env.API_PREFIX || '/api/v1',
    MONGODB_URI: process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studio99_erp',
    JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET || 'your_super_secret_access_key_change_in_production',
    JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET || 'your_super_secret_refresh_key_change_in_production',
    JWT_ACCESS_EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    JWT_REFRESH_EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
    CORS_ORIGINS: process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173',
    RATE_LIMIT_WINDOW_MS: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10),
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX || '100', 10),
    LOG_LEVEL: process.env.LOG_LEVEL || 'debug',
    APP_NAME: process.env.APP_NAME || 'Studio99 ERP',
    DEFAULT_ADMIN_EMAIL: process.env.DEFAULT_ADMIN_EMAIL || 'admin@studio99.com',
    DEFAULT_ADMIN_PASSWORD: process.env.DEFAULT_ADMIN_PASSWORD || 'Admin@123456',
    DEFAULT_BRANCH_NAME: process.env.DEFAULT_BRANCH_NAME || 'Main Branch',
};
exports.default = exports.env;
