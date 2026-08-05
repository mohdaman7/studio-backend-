"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.advancedAuthService = exports.AdvancedAuthService = void 0;
const user_repository_1 = require("../repositories/user.repository");
const Company_model_1 = require("../models/Company.model");
const Branch_model_1 = require("../models/Branch.model");
const Role_model_1 = require("../models/Role.model");
const error_middleware_1 = require("../middlewares/error.middleware");
const crypto_1 = __importDefault(require("crypto"));
class AdvancedAuthService {
    async registerTenant(input) {
        // 1. Check duplicate emails
        const existing = await user_repository_1.userRepository.findByEmail(input.email);
        if (existing) {
            throw new error_middleware_1.AppError('Email address is already registered', 409, 'DUPLICATE_EMAIL');
        }
        // 2. Create Company
        const company = await Company_model_1.Company.create({
            name: input.companyName,
            email: input.email,
            phone: input.phone,
        });
        // 3. Create Default Branch
        const branch = await Branch_model_1.Branch.create({
            companyId: company._id,
            name: 'Main Headquarter',
            code: `HQ-${company.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
            phone: input.phone,
        });
        // 4. Create Role or fetch Owner Role
        let ownerRole = await Role_model_1.Role.findOne({ slug: 'owner' });
        if (!ownerRole) {
            ownerRole = await Role_model_1.Role.create({
                name: 'Owner',
                slug: 'owner',
                permissions: ['user:read', 'user:create', 'user:update', 'product:read', 'product:create', 'sale:create', 'report:read'],
                isSystem: true,
            });
        }
        // 5. Generate Email Verification Token
        const verificationToken = crypto_1.default.randomBytes(32).toString('hex');
        // 6. Create User
        const user = await user_repository_1.userRepository.create({
            companyId: company._id,
            branchId: branch._id,
            name: input.adminName,
            email: input.email,
            password: input.password,
            role: ownerRole._id,
            verificationToken,
            isEmailVerified: false,
        });
        return { company, branch, user };
    }
    async verifyEmail(token) {
        const user = await user_repository_1.userRepository.findOne({ verificationToken: token });
        if (!user) {
            throw new error_middleware_1.AppError('Invalid or expired email verification token', 400, 'INVALID_VERIFICATION_TOKEN');
        }
        user.isEmailVerified = true;
        user.verificationToken = undefined;
        await user.save();
        return user;
    }
    async forgotPassword(email) {
        const user = await user_repository_1.userRepository.findOne({ email });
        if (!user) {
            // Return success statement for security obscurities
            return;
        }
        const resetToken = crypto_1.default.randomBytes(32).toString('hex');
        user.resetPasswordToken = crypto_1.default.createHash('sha256').update(resetToken).digest('hex');
        user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
        await user.save();
        // Log the token for local setup (mocking email transport)
        console.log(`🔑 Reset Password Token: ${resetToken}`);
        return resetToken;
    }
    async resetPassword(token, password) {
        const hashedToken = crypto_1.default.createHash('sha256').update(token).digest('hex');
        const user = await user_repository_1.userRepository.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordExpires: { $gt: new Date() },
        });
        if (!user) {
            throw new error_middleware_1.AppError('Password reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
        }
        user.password = password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        // Clear existing sessions
        user.refreshTokens = [];
        await user.save();
        return user;
    }
}
exports.AdvancedAuthService = AdvancedAuthService;
exports.advancedAuthService = new AdvancedAuthService();
exports.default = exports.advancedAuthService;
