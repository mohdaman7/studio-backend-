"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.disconnectDB = exports.connectDB = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const env_1 = require("./env");
const logger_1 = require("../utils/logger");
const connectDB = async () => {
    try {
        const conn = await mongoose_1.default.connect(env_1.env.MONGODB_URI);
        logger_1.logger.info(`✅ MongoDB Connected: ${conn.connection.host}`);
    }
    catch (error) {
        logger_1.logger.error(`❌ MongoDB connection failed: ${error.message}`);
        process.exit(1);
    }
};
exports.connectDB = connectDB;
const disconnectDB = async () => {
    await mongoose_1.default.connection.close();
    logger_1.logger.info('MongoDB connection closed.');
};
exports.disconnectDB = disconnectDB;
