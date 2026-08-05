"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteNotification = exports.markAllAsRead = exports.markAsRead = exports.getNotifications = void 0;
const asyncHandler_1 = require("../utils/asyncHandler");
const apiResponse_1 = require("../utils/apiResponse");
const Notification_model_1 = require("../models/Notification.model");
const mongoose_1 = __importDefault(require("mongoose"));
// ─── Get Notifications ────────────────────────────────────────────────────────
exports.getNotifications = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const page = parseInt(req.query.page || '1', 10);
    const limit = parseInt(req.query.limit || '20', 10);
    const skip = (page - 1) * limit;
    const filter = {
        $or: [
            { userId: new mongoose_1.default.Types.ObjectId(userId) },
            { isGlobal: true },
        ],
    };
    if (req.query.isRead !== undefined)
        filter.isRead = req.query.isRead === 'true';
    const [data, total] = await Promise.all([
        Notification_model_1.Notification.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean().exec(),
        Notification_model_1.Notification.countDocuments(filter).exec(),
    ]);
    const unreadCount = await Notification_model_1.Notification.countDocuments({ ...filter, isRead: false }).exec();
    return apiResponse_1.ApiResponse.paginated(res, 'Notifications fetched', data, page, limit, total, { unreadCount });
});
// ─── Mark as Read ─────────────────────────────────────────────────────────────
exports.markAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    const { id } = req.params;
    await Notification_model_1.Notification.findOneAndUpdate({ _id: id, $or: [{ userId }, { isGlobal: true }] }, { $set: { isRead: true } }).exec();
    return apiResponse_1.ApiResponse.success(res, 'Notification marked as read');
});
// ─── Mark All as Read ─────────────────────────────────────────────────────────
exports.markAllAsRead = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    await Notification_model_1.Notification.updateMany({ $or: [{ userId }, { isGlobal: true }], isRead: false }, { $set: { isRead: true } }).exec();
    return apiResponse_1.ApiResponse.success(res, 'All notifications marked as read');
});
// ─── Delete Notification ──────────────────────────────────────────────────────
exports.deleteNotification = (0, asyncHandler_1.asyncHandler)(async (req, res) => {
    const userId = req.user?.userId;
    await Notification_model_1.Notification.findOneAndDelete({ _id: req.params.id, userId }).exec();
    return apiResponse_1.ApiResponse.success(res, 'Notification deleted');
});
