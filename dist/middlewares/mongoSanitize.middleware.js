"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.mongoSanitizeMiddleware = void 0;
const hasKeys = (obj) => {
    return obj && typeof obj === 'object';
};
const sanitize = (obj) => {
    if (Array.isArray(obj)) {
        for (let i = 0; i < obj.length; i++) {
            if (hasKeys(obj[i])) {
                obj[i] = sanitize(obj[i]);
            }
        }
    }
    else if (hasKeys(obj)) {
        const keys = Object.keys(obj);
        for (const key of keys) {
            if (key.startsWith('$')) {
                delete obj[key];
            }
            else if (hasKeys(obj[key])) {
                obj[key] = sanitize(obj[key]);
            }
        }
    }
    return obj;
};
const mongoSanitizeMiddleware = (req, res, next) => {
    if (req.body)
        req.body = sanitize(req.body);
    if (req.params)
        req.params = sanitize(req.params);
    // For req.query in Express 5, it is a getter, so we clone it first to make it writable, sanitize, and redefine it or attach a sanitized version
    if (req.query) {
        try {
            const sanitizedQuery = sanitize(JSON.parse(JSON.stringify(req.query)));
            Object.defineProperty(req, 'query', {
                value: sanitizedQuery,
                writable: true,
                configurable: true
            });
        }
        catch (e) {
            // Fallback
        }
    }
    next();
};
exports.mongoSanitizeMiddleware = mongoSanitizeMiddleware;
