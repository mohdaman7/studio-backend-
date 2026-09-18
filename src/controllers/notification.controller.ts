import { Request, Response } from 'express';
import { asyncHandler } from '../utils/asyncHandler';
import { ApiResponse } from '../utils/apiResponse';
import { Notification } from '../models/Notification.model';
import { Sale } from '../models/Sale.model';
import { sseManager } from '../utils/sseManager';
import mongoose from 'mongoose';

// ─── SSE Stream for Real-time Notifications & Sales ───────────────────────────
export const streamNotifications = (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId || '';
  const userId = (req.user as any)?.userId || 'anonymous';
  const role = (req.user as any)?.role || 'cashier';

  sseManager.registerClient(companyId, userId, role, res);
};

// ─── Get Recent Sales for Polling Fallback ────────────────────────────────────
export const getRecentSales = asyncHandler(async (req: Request, res: Response) => {
  const companyId = (req.user as any)?.companyId;
  const limit = Math.min(parseInt((req.query.limit as string) || '20', 10), 50);

  const filter: any = {};
  if (companyId && mongoose.Types.ObjectId.isValid(companyId)) {
    filter.$or = [
      { companyId: new mongoose.Types.ObjectId(companyId) },
      { companyId: { $exists: false } },
    ];
  }

  const sales = await Sale.find(filter)
    .sort({ createdAt: -1, saleDate: -1 })
    .limit(limit)
    .populate('customerId', 'name phone')
    .populate('cashierId', 'name')
    .populate('items.productId', 'name sku')
    .lean()
    .exec();

  const formatted = sales.map((sale: any) => ({
    id: sale._id.toString(),
    invoiceNumber: sale.invoiceNumber,
    cashierName: sale.cashierId?.name || 'Store Cashier',
    customerName: sale.customerId?.name || 'Walk-in Customer',
    customerPhone: sale.customerId?.phone || '',
    grandTotal: sale.grandTotal,
    subtotal: sale.subtotal,
    discount: sale.discount,
    tax: sale.taxTotal,
    paymentMethod: sale.paymentMethod,
    itemCount: sale.items?.length || 0,
    items: (sale.items || []).map((item: any) => ({
      name: item.productId?.name || 'Product',
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalAmount || item.unitPrice * item.quantity,
      selectedSize: item.selectedSize,
      selectedColor: item.selectedColor,
      sku: item.productId?.sku,
    })),
    timestamp: sale.saleDate || sale.createdAt || new Date().toISOString(),
    isRead: false,
  }));

  return ApiResponse.success(res, 'Recent sales fetched', formatted);
});

// ─── Get Notifications ────────────────────────────────────────────────────────
export const getNotifications = asyncHandler(async (req: Request, res: Response) => {
  const userId = (req.user as any)?.userId;
  const companyId = (req.user as any)?.companyId;
  const page = parseInt((req.query.page as string) || '1', 10);
  const limit = parseInt((req.query.limit as string) || '20', 10);
  const skip = (page - 1) * limit;

  const orConditions: any[] = [{ isGlobal: true }];
  if (userId && mongoose.Types.ObjectId.isValid(userId)) {
    orConditions.push({ userId: new mongoose.Types.ObjectId(userId) });
  }

  const filter: any = { $or: orConditions };
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
