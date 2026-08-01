import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { Notification } from '../models/Notification.model';
import mongoose from 'mongoose';

// ─── Get Notifications ────────────────────────────────────────────────────────
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  const filter: any = {
    $or: [
      { userId: new mongoose.Types.ObjectId(userId) },
      { isGlobal: true },
    ],
  };
  if (req.query.isRead !== undefined) filter.isRead = req.query.isRead === 'true';

  const [data, total] = await Promise.all([
    Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
    Notification.countDocuments(filter).exec(),
  ]);

  const unreadCount = await Notification.countDocuments({ ...filter, isRead: false }).exec();

  return ApiResponse.paginated(res, 'Notifications fetched', data, page, limit, total, { unreadCount });
});

// ─── Mark as Read ─────────────────────────────────────────────────────────────
export const markAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const { id } = req.params;

  await Notification.findOneAndUpdate(
    { _id: id, $or: [{ userId }, { isGlobal: true }] },
    { $set: { isRead: true } }
  ).exec();

  return ApiResponse.success(res, 'Notification marked as read');
});

// ─── Mark All as Read ─────────────────────────────────────────────────────────
export const markAllAsRead = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;

  await Notification.updateMany(
    { $or: [{ userId }, { isGlobal: true }], isRead: false },
    { $set: { isRead: true } }
  ).exec();

  return ApiResponse.success(res, 'All notifications marked as read');
});

// ─── Delete Notification ──────────────────────────────────────────────────────
export const deleteNotification = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  
  await Notification.findOneAndDelete({ _id: req.params.id, userId }).exec();
  
  return ApiResponse.success(res, 'Notification deleted');
});
