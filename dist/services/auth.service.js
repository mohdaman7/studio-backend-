"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = exports.AuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const tokens_1 = require("../utils/tokens");
const error_middleware_1 = require("../middlewares/error.middleware");
const User_model_1 = require("../models/User.model");
class AuthService {
    async register(input) {
        const existing = await user_repository_1.userRepository.findByEmail(input.email);
        if (existing)
            throw new error_middleware_1.AppError('Email already in use', 409);
        const user = await user_repository_1.userRepository.create(input);
        const populated = await User_model_1.User.findById(user._id).populate('role').exec();
        const roleSlug = populated?.role?.slug || 'cashier';
        const { accessToken, refreshToken } = (0, tokens_1.generateTokenPair)(user._id.toString(), user.email, roleSlug);
        return { user: populated || user, accessToken, refreshToken };
    }
    async login(input) {
        const user = await User_model_1.User.findOne({ email: input.email }).select('+password').populate('role').exec();
        if (!user)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        const isMatch = await user.comparePassword(input.password);
        if (!isMatch)
            throw new error_middleware_1.AppError('Invalid email or password', 401);
        const roleSlug = user.role?.slug || 'super-admin';
        const { accessToken, refreshToken } = (0, tokens_1.generateTokenPair)(user._id.toString(), user.email, roleSlug);
        return { user, accessToken, refreshToken };
    }
    async refreshTokens(token) {
        try {
            const decoded = (0, tokens_1.verifyRefreshToken)(token);
            const user = await User_model_1.User.findById(decoded.userId).populate('role').exec();
            if (!user)
                throw new error_middleware_1.AppError('User not found', 404);
            const roleSlug = user.role?.slug || 'super-admin';
            return (0, tokens_1.generateTokenPair)(user._id.toString(), user.email, roleSlug);
        }
        catch (error) {
            throw new error_middleware_1.AppError('Invalid refresh token', 401);
        }
    }
    async logout(userId, token) {
        await User_model_1.User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } }).exec();
    }
    async getMe(userId) {
        const user = await User_model_1.User.findById(userId).populate('role').exec();
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        return user;
    }
}
exports.AuthService = AuthService;
exports.authService = new AuthService();
exports.default = exports.authService;
