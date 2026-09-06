import { userRepository } from '../repositories/user.repository';
import { generateTokenPair, verifyRefreshToken } from '../utils/tokens';
import { AppError } from '../middlewares/error.middleware';
import { User } from '../models/User.model';

export class AuthService {
  async register(input: any) {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) throw new AppError('Email already in use', 409);

    const user = await userRepository.create(input);
    const populated = await User.findById(user._id).populate('role').exec();
    const roleSlug = (populated?.role as any)?.slug || 'cashier';
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString(), user.email, roleSlug);
    return { user: populated || user, accessToken, refreshToken };
  }

  async login(input: any) {
    const user = await User.findOne({ email: input.email }).select('+password').populate('role').exec();
    if (!user) throw new AppError('Invalid email or password', 401);

    const isMatch = await user.comparePassword(input.password);
    if (!isMatch) throw new AppError('Invalid email or password', 401);

    const roleSlug = (user.role as any)?.slug || 'super-admin';
    const { accessToken, refreshToken } = generateTokenPair(user._id.toString(), user.email, roleSlug);
    return { user, accessToken, refreshToken };
  }

  async refreshTokens(token: string) {
    try {
      const decoded = verifyRefreshToken(token) as any;
      const user = await User.findById(decoded.userId).populate('role').exec();
      if (!user) throw new AppError('User not found', 404);

      const roleSlug = (user.role as any)?.slug || 'super-admin';
      return generateTokenPair(user._id.toString(), user.email, roleSlug);
    } catch (error) {
      throw new AppError('Invalid refresh token', 401);
    }
  }

  async logout(userId: string, token: string) {
    await User.findByIdAndUpdate(userId, { $pull: { refreshTokens: token } }).exec();
  }

  async getMe(userId: string) {
    const user = await User.findById(userId).populate('role').exec();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }
}

export const authService = new AuthService();
export default authService;
