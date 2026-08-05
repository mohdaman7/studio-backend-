"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roleService = exports.userService = exports.RoleService = exports.UserService = void 0;
const User_model_1 = require("../models/User.model");
const Role_model_1 = require("../models/Role.model");
const error_middleware_1 = require("../middlewares/error.middleware");
class UserService {
    async getAll(query) {
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '10', 10);
        const skip = (page - 1) * limit;
        const [users, total] = await Promise.all([
            User_model_1.User.find().skip(skip).limit(limit).populate('role').exec(),
            User_model_1.User.countDocuments().exec(),
        ]);
        return { users, total, page, limit };
    }
    async getById(id) {
        const user = await User_model_1.User.findById(id).populate('role').exec();
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        return user;
    }
    async create(data) {
        return User_model_1.User.create(data);
    }
    async update(id, data) {
        const user = await User_model_1.User.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        return user;
    }
    async delete(id) {
        const user = await User_model_1.User.findByIdAndDelete(id).exec();
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        return user;
    }
    async toggleActive(id) {
        const user = await User_model_1.User.findById(id).exec();
        if (!user)
            throw new error_middleware_1.AppError('User not found', 404);
        user.isActive = !user.isActive;
        return user.save();
    }
}
exports.UserService = UserService;
class RoleService {
    async getAll() {
        return Role_model_1.Role.find().exec();
    }
    async getById(id) {
        const role = await Role_model_1.Role.findById(id).exec();
        if (!role)
            throw new error_middleware_1.AppError('Role not found', 404);
        return role;
    }
    async create(data) {
        return Role_model_1.Role.create(data);
    }
    async update(id, data) {
        const role = await Role_model_1.Role.findByIdAndUpdate(id, data, { new: true }).exec();
        if (!role)
            throw new error_middleware_1.AppError('Role not found', 404);
        return role;
    }
    async delete(id) {
        const role = await Role_model_1.Role.findByIdAndDelete(id).exec();
        if (!role)
            throw new error_middleware_1.AppError('Role not found', 404);
        return role;
    }
}
exports.RoleService = RoleService;
exports.userService = new UserService();
exports.roleService = new RoleService();
exports.default = exports.userService;
