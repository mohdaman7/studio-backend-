"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRole = exports.updateRole = exports.createRole = exports.getRoleById = exports.getRoles = exports.toggleUserActive = exports.deleteUser = exports.updateUser = exports.createUser = exports.getUserById = exports.getUsers = void 0;
const user_service_1 = require("../services/user.service");
const apiResponse_1 = require("../utils/apiResponse");
const user_validator_1 = require("../validators/user.validator");
const asyncHandler_1 = require("../utils/asyncHandler");
// Helper to get string ID safely
const getParamId = (req) => {
    return String(req.params.id || '');
};
// ─── User Controller ─────────────────────────────────────────────────────────
exports.getUsers = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const result = await user_service_1.userService.getAll(req);
    return apiResponse_1.ApiResponse.paginated(res, 'Users fetched successfully', result.users, result.page, result.limit, result.total);
});
exports.getUserById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const user = await user_service_1.userService.getById(id);
    return apiResponse_1.ApiResponse.success(res, 'User fetched successfully', user);
});
exports.createUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const validated = user_validator_1.createUserSchema.parse(req.body);
    const user = await user_service_1.userService.create(validated);
    return apiResponse_1.ApiResponse.created(res, 'User created successfully', user);
});
exports.updateUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const validated = user_validator_1.updateUserSchema.parse(req.body);
    const user = await user_service_1.userService.update(id, validated);
    return apiResponse_1.ApiResponse.success(res, 'User updated successfully', user);
});
exports.deleteUser = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await user_service_1.userService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'User deleted successfully');
});
exports.toggleUserActive = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const user = await user_service_1.userService.toggleActive(id);
    return apiResponse_1.ApiResponse.success(res, `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`, user);
});
// ─── Role Controller ─────────────────────────────────────────────────────────
exports.getRoles = (0, asyncHandler_1.asyncHandler)(async (_req, res) => {
    const roles = await user_service_1.roleService.getAll();
    return apiResponse_1.ApiResponse.success(res, 'Roles fetched successfully', roles);
});
exports.getRoleById = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const role = await user_service_1.roleService.getById(id);
    return apiResponse_1.ApiResponse.success(res, 'Role fetched successfully', role);
});
exports.createRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const role = await user_service_1.roleService.create(req.body);
    return apiResponse_1.ApiResponse.created(res, 'Role created successfully', role);
});
exports.updateRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    const role = await user_service_1.roleService.update(id, req.body);
    return apiResponse_1.ApiResponse.success(res, 'Role updated successfully', role);
});
exports.deleteRole = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const id = getParamId(req);
    await user_service_1.roleService.delete(id);
    return apiResponse_1.ApiResponse.success(res, 'Role deleted successfully');
});
