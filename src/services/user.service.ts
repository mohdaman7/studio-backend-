import { User } from '../models/User.model';
import { Role } from '../models/Role.model';
import { AppError } from '../middlewares/error.middleware';

export class UserService {
  async getAll(query: any) {
    const page = parseInt(query.page || '1', 10);
    const limit = parseInt(query.limit || '10', 10);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      User.find().skip(skip).limit(limit).populate('role').exec(),
      User.countDocuments().exec(),
    ]);

    return { users, total, page, limit };
  }

  async getById(id: string) {
    const user = await User.findById(id).populate('role').exec();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async create(data: any) {
    return User.create(data);
  }

  async update(id: string, data: any) {
    const user = await User.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async delete(id: string) {
    const user = await User.findByIdAndDelete(id).exec();
    if (!user) throw new AppError('User not found', 404);
    return user;
  }

  async toggleActive(id: string) {
    const user = await User.findById(id).exec();
    if (!user) throw new AppError('User not found', 404);
    user.isActive = !user.isActive;
    return user.save();
  }
}

export class RoleService {
  async getAll() {
    return Role.find().exec();
  }

  async getById(id: string) {
    const role = await Role.findById(id).exec();
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async create(data: any) {
    return Role.create(data);
  }

  async update(id: string, data: any) {
    const role = await Role.findByIdAndUpdate(id, data, { new: true }).exec();
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }

  async delete(id: string) {
    const role = await Role.findByIdAndDelete(id).exec();
    if (!role) throw new AppError('Role not found', 404);
    return role;
  }
}

export const userService = new UserService();
export const roleService = new RoleService();
export default userService;
