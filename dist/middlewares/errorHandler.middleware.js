"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.notFoundHandler = exports.globalErrorHandler = void 0;
const zod_1 = require("zod");
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const globalErrorHandler = (err, req, res, next) => {
    let statusCode = err.statusCode || 500;
    let message = err.message || 'Internal Server Error';
    let code = err.code || 'INTERNAL_SERVER_ERROR';
    let errors = undefined;
    // Log unhandled non-operational exceptions
    if (!err.isOperational) {
        logger_1.logger.error('💥 Unhandled Exception:', {
            error: err.message,
            stack: err.stack,
            path: req.originalUrl,
            body: req.body,
        });
    }
    else {
        logger_1.logger.warn(`⚠ Application Error: ${message}`, { path: req.originalUrl });
    }
    // Zod Validation Formatting
    if (err instanceof zod_1.ZodError) {
        statusCode = 400;
        message = 'Validation errors occurred';
        code = 'VALIDATION_ERROR';
        errors = err.issues.map((e) => ({
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
        ...(env_1.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
};
exports.globalErrorHandler = globalErrorHandler;
const notFoundHandler = (req, res, next) => {
    res.status(404).json({
        success: false,
        message: `Cannot find ${req.method} ${req.originalUrl} on this server`,
        code: 'ROUTE_NOT_FOUND',
    });
};
exports.notFoundHandler = notFoundHandler;
