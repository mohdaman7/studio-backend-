import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { AuditLog } from '../models/AuditLog.model';
import mongoose from 'mongoose';

// ─── Get Audit Logs ───────────────────────────────────────────────────────────
export const getAuditLogs = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  const filter: any = { companyId: new mongoose.Types.ObjectId(companyId) };
  if (req.query.module) filter.module = req.query.module;
  if (req.query.userId) filter.userId = new mongoose.Types.ObjectId(req.query.userId as string);
  if (req.query.action) filter.action = { $regex: req.query.action, $options: 'i' };
  if (req.query.startDate || req.query.endDate) {
    filter.createdAt = {};
    if (req.query.startDate) filter.createdAt.$gte = new Date(req.query.startDate as string);
    if (req.query.endDate) filter.createdAt.$lte = new Date(req.query.endDate as string);
  }

  const [data, total] = await Promise.all([
    AuditLog.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('userId', 'name email')
      .lean()
      .exec(),
    AuditLog.countDocuments(filter).exec(),
  ]);

  return ApiResponse.paginated(res, 'Audit logs fetched successfully', data, page, limit, total);
});

// ─── Create Audit Entry (Internal helper exposed as API) ──────────────────────
export const createAuditLog = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const userId = (req.user as any)?.userId;

  const log = await AuditLog.create({
    companyId,
    userId,
    action: req.body.action,
    module: req.body.module,
    details: req.body.details,
    ipAddress: req.ip,
  });

  return ApiResponse.created(res, 'Audit log created', log);
});
