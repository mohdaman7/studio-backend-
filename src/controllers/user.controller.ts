import { Request, Response } from 'express';
import { userService, roleService } from '../services/user.service';
import { ApiResponse } from '../utils/apiResponse';
import { createUserSchema, updateUserSchema } from '../validators/user.validator';
import { asyncHandler } from '../utils/asyncHandler';

// ─── User Controller ─────────────────────────────────────────────────────────
export const getUsers = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getAll(req);
  return ApiResponse.paginated(res, 'Users fetched successfully', result.users, result.page, result.limit, result.total);
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.getById(req.params.id);
  return ApiResponse.success(res, 'User fetched successfully', user);
});

export const createUser = asyncHandler(async (req: Request, res: Response) => {
  const validated = createUserSchema.parse(req.body);
  const user = await userService.create(validated);
  return ApiResponse.created(res, 'User created successfully', user);
});

export const updateUser = asyncHandler(async (req: Request, res: Response) => {
  const validated = updateUserSchema.parse(req.body);
  const user = await userService.update(req.params.id, validated);
  return ApiResponse.success(res, 'User updated successfully', user);
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
  await userService.delete(req.params.id);
  return ApiResponse.success(res, 'User deleted successfully');
});

export const toggleUserActive = asyncHandler(async (req: Request, res: Response) => {
  const user = await userService.toggleActive(req.params.id);
  return ApiResponse.success(res, `User status updated to ${user.isActive ? 'Active' : 'Inactive'}`, user);
});

// ─── Role Controller ─────────────────────────────────────────────────────────
export const getRoles = asyncHandler(async (_req: Request, res: Response) => {
  const roles = await roleService.getAll();
  return ApiResponse.success(res, 'Roles fetched successfully', roles);
});

export const getRoleById = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.getById(req.params.id);
  return ApiResponse.success(res, 'Role fetched successfully', role);
});

export const createRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.create(req.body);
  return ApiResponse.created(res, 'Role created successfully', role);
});

export const updateRole = asyncHandler(async (req: Request, res: Response) => {
  const role = await roleService.update(req.params.id, req.body);
  return ApiResponse.success(res, 'Role updated successfully', role);
});

export const deleteRole = asyncHandler(async (req: Request, res: Response) => {
  await roleService.delete(req.params.id);
  return ApiResponse.success(res, 'Role deleted successfully');
});
