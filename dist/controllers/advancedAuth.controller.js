"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProfile = exports.resetPassword = exports.forgotPassword = exports.verifyEmail = exports.registerTenant = void 0;
const advancedAuth_service_1 = require("../services/advancedAuth.service");
const apiResponse_1 = require("../utils/apiResponse");
const auth_validator_1 = require("../validators/auth.validator");
const asyncHandler_1 = require("../utils/asyncHandler");
const User_model_1 = require("../models/User.model");
exports.registerTenant = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await advancedAuth_service_1.advancedAuthService.registerTenant(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Tenant registered successfully. Please verify your email.', result);
});
exports.verifyEmail = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token } = auth_validator_1.verifyEmailSchema.parse(req.query);
    await advancedAuth_service_1.advancedAuthService.verifyEmail(token);
    return apiResponse_1.ApiResponse.success(res, 'Email verified successfully.');
});
exports.forgotPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { email } = auth_validator_1.forgotPasswordSchema.parse(req.body);
    await advancedAuth_service_1.advancedAuthService.forgotPassword(email);
    return apiResponse_1.ApiResponse.success(res, 'If account exists, reset instructions have been shared.');
});
exports.resetPassword = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const { token, password } = auth_validator_1.resetPasswordSchema.parse(req.body);
    await advancedAuth_service_1.advancedAuthService.resetPassword(token, password);
    return apiResponse_1.ApiResponse.success(res, 'Password changed successfully. Please login.');
});
exports.updateProfile = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const updates = auth_validator_1.updateProfileSchema.parse(req.body);
    if (!req.user)
        return apiResponse_1.ApiResponse.unauthorized(res);
    const updatedUser = await User_model_1.User.findByIdAndUpdate(req.user.userId, updates, { new: true });
    return apiResponse_1.ApiResponse.success(res, 'Profile updated successfully', updatedUser);
});
