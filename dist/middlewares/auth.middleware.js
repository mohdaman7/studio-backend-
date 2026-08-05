"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authorizePermission = exports.authenticate = void 0;
const tokens_1 = require("../utils/tokens");
const error_middleware_1 = require("./error.middleware");
const User_model_1 = require("../models/User.model");
const Role_model_1 = require("../models/Role.model");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.authenticate = (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
    let token;
    if (req.headers.authorization?.startsWith('Bearer ')) {
        token = req.headers.authorization.split(' ')[1];
    }
    else if (req.cookies?.accessToken) {
        token = req.cookies.accessToken;
    }
    if (!token) {
        throw new error_middleware_1.AuthenticationError('Session expired or access token missing');
    }
    try {
        const decoded = (0, tokens_1.verifyAccessToken)(token);
        // Check database to ensure user is active and has correct tenant scoping
        const user = await User_model_1.User.findById(decoded.userId).select('isActive companyId branchId').lean();
        if (!user || !user.isActive) {
            throw new error_middleware_1.AuthenticationError('User profile deactivated or deleted');
        }
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            role: decoded.role,
            companyId: user.companyId.toString(),
            branchId: user.branchId?.toString(),
        };
        next();
    }
    catch (error) {
        throw new error_middleware_1.AuthenticationError('Invalid signature or expired session token');
    }
});
/**
 * Authorize using system permission codes.
 * Bypasses checks for Super Admin role slugs automatically.
 */
const authorizePermission = (permission) => {
    return (0, asyncHandler_1.asyncHandler)(async (req, res, next) => {
        if (!req.user) {
            throw new error_middleware_1.AuthenticationError();
        }
        if (req.user.role === 'super-admin') {
            return next();
        }
        const role = await Role_model_1.Role.findOne({ slug: req.user.role, isActive: true }).lean();
        if (!role || !role.permissions.includes(permission)) {
            throw new error_middleware_1.AuthorizationError(`Access denied. Missing permission: ${permission}`);
        }
        next();
    });
};
exports.authorizePermission = authorizePermission;
