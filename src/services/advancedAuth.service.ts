import { userRepository } from '../repositories/user.repository';
import { Company } from '../models/Company.model';
import { Branch } from '../models/Branch.model';
import { Role } from '../models/Role.model';
import { AppError, AuthenticationError } from '../middlewares/error.middleware';
import { generateTokenPair } from '../utils/tokens';
import crypto from 'crypto';

export class AdvancedAuthService {
  async registerTenant(input: {
    companyName: string;
    adminName: string;
    email: string;
    phone: string;
    password: string;
  }) {
    // 1. Check duplicate emails
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new AppError('Email address is already registered', 409, 'DUPLICATE_EMAIL');
    }

    // 2. Create Company
    const company = await Company.create({
      name: input.companyName,
      email: input.email,
      phone: input.phone,
    });

    // 3. Create Default Branch
    const branch = await Branch.create({
      companyId: company._id,
      name: 'Main Headquarter',
      code: `HQ-${company.name.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`,
      phone: input.phone,
    });

    // 4. Create Role or fetch Owner Role
    let ownerRole = await Role.findOne({ slug: 'owner' });
    if (!ownerRole) {
      ownerRole = await Role.create({
        name: 'Owner',
        slug: 'owner',
        permissions: ['user:read', 'user:create', 'user:update', 'product:read', 'product:create', 'sale:create', 'report:read'],
        isSystem: true,
      });
    }

    // 5. Generate Email Verification Token
    const verificationToken = crypto.randomBytes(32).toString('hex');

    // 6. Create User
    const user = await userRepository.create({
      companyId: company._id,
      branchId: branch._id,
      name: input.adminName,
      email: input.email,
      password: input.password,
      role: ownerRole._id as any,
      verificationToken,
      isEmailVerified: false,
    } as any);

    return { company, branch, user };
  }

  async verifyEmail(token: string) {
    const user = await userRepository.findOne({ verificationToken: token });
    if (!user) {
      throw new AppError('Invalid or expired email verification token', 400, 'INVALID_VERIFICATION_TOKEN');
    }

    user.isEmailVerified = true;
    user.verificationToken = undefined;
    await user.save();
    return user;
  }

  async forgotPassword(email: string) {
    const user = await userRepository.findOne({ email });
    if (!user) {
      // Return success statement for security obscurities
      return;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour expiration
    await user.save();

    // Log the token for local setup (mocking email transport)
    console.log(`🔑 Reset Password Token: ${resetToken}`);
    return resetToken;
  }

  async resetPassword(token: string, password: string) {
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await userRepository.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new AppError('Password reset token is invalid or has expired', 400, 'INVALID_RESET_TOKEN');
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

export const advancedAuthService = new AdvancedAuthService();
export default advancedAuthService;
