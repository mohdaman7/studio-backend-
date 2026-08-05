"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.logout = exports.refresh = exports.login = exports.register = void 0;
const auth_service_1 = require("../services/auth.service");
const apiResponse_1 = require("../utils/apiResponse");
const auth_validator_1 = require("../validators/auth.validator");
const asyncHandler_1 = require("../utils/asyncHandler");
exports.register = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = auth_validator_1.registerSchema.parse(req.body);
    const result = await auth_service_1.authService.register(validated);
    // Set refresh token cookie
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
    return apiResponse_1.ApiResponse.created(res, 'User registered successfully', {
        user: result.user,
        accessToken: result.accessToken,
    });
});
exports.login = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = auth_validator_1.loginSchema.parse(req.body);
    const result = await auth_service_1.authService.login(validated);
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return apiResponse_1.ApiResponse.success(res, 'Logged in successfully', {
        user: result.user,
        accessToken: result.accessToken,
    });
});
exports.refresh = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (!token)
        return apiResponse_1.ApiResponse.badRequest(res, 'Refresh token is required');
    const result = await auth_service_1.authService.refreshTokens(token);
    res.cookie('refreshToken', result.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict',
        maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return apiResponse_1.ApiResponse.success(res, 'Token refreshed successfully', {
        accessToken: result.accessToken,
    });
});
exports.logout = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const token = req.body.refreshToken || req.cookies?.refreshToken;
    if (token && req.user) {
        await auth_service_1.authService.logout(req.user.userId, token);
    }
    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');
    return apiResponse_1.ApiResponse.success(res, 'Logged out successfully');
});
exports.getMe = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    if (!req.user)
        return apiResponse_1.ApiResponse.unauthorized(res);
    const user = await auth_service_1.authService.getMe(req.user.userId);
    return apiResponse_1.ApiResponse.success(res, 'Profile fetched successfully', user);
});
