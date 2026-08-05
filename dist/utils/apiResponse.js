"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiResponse = void 0;
class ApiResponse {
    static success(res, message, data = {}, statusCode = 200) {
        return res.status(statusCode).json({
            success: true,
            message,
            data,
        });
    }
    static created(res, message, data = {}) {
        return this.success(res, message, data, 201);
    }
    static paginated(res, message, data, page, limit, total, extra = {}) {
        const totalPages = Math.ceil(total / limit);
        return res.status(200).json({
            success: true,
            message,
            data,
            pagination: {
                page,
                limit,
                total,
                totalPages,
            },
            ...extra,
        });
    }
    static error(res, message, statusCode = 500, code = 'INTERNAL_ERROR', errors = undefined) {
        return res.status(statusCode).json({
            success: false,
            message,
            code,
            ...(errors && { errors })
        });
    }
    static badRequest(res, message, errors = undefined) {
        return this.error(res, message, 400, 'BAD_REQUEST', errors);
    }
    static unauthorized(res, message = 'Unauthorized') {
        return this.error(res, message, 401, 'UNAUTHORIZED');
    }
    static notFound(res, message = 'Resource not found') {
        return this.error(res, message, 404, 'NOT_FOUND');
    }
    static forbidden(res, message = 'Access denied') {
        return this.error(res, message, 403, 'FORBIDDEN');
    }
}
exports.ApiResponse = ApiResponse;
exports.default = ApiResponse;
